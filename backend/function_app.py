import azure.functions as func
import logging
import os
import io
import json
import pandas as pd
import lightgbm as lgb
from azure.storage.blob import BlobServiceClient

app = func.FunctionApp()

# Global variables to hold the model and metadata for reuse between function calls
model = None
model_meta = None

def load_model_and_meta():
    """
    Connects to Azure Blob Storage and downloads the model and metadata files during a "cold start".
    """
    global model, model_meta
    logging.info("Attempting to load model and metadata from Blob Storage...")

    try:
        connection_string = os.environ["STORAGE_CONNECTION_STRING"]
        container_name = os.environ.get("MODEL_CONTAINER", "models")
        meta_file_name = os.environ.get("META_FILE", "model_meta.json")
        model_file_name = os.environ.get("MODEL_FILE", "model.txt")

        blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        container_client = blob_service_client.get_container_client(container_name)

        meta_blob_client = container_client.get_blob_client(meta_file_name)
        meta_downloader = meta_blob_client.download_blob()
        model_meta = json.loads(meta_downloader.readall())
        logging.info(f"Successfully loaded metadata.")

        model_blob_client = container_client.get_blob_client(model_file_name)
        model_downloader = model_blob_client.download_blob()
        model_bytes = model_downloader.readall()
        model = lgb.Booster(model_str=model_bytes.decode('utf-8'))
        logging.info("Successfully loaded LightGBM model.")

    except Exception as e:
        logging.error(f"Failed to load model or metadata: {e}")
        model = None
        model_meta = None


@app.route(route="predict", auth_level=func.AuthLevel.FUNCTION, methods=['POST'])
def predict(req: func.HttpRequest) -> func.HttpResponse:
    """
    The main function triggered by an HTTP POST request to /api/predict.
    """
    logging.info('Python HTTP trigger function processed a request.')

    if model is None or model_meta is None:
        load_model_and_meta()

    if model is None or model_meta is None:
        return func.HttpResponse(
             "Model is not loaded. Check server logs for details.",
             status_code=500
        )

    try:
        file = req.files.get('file')
        if not file:
            return func.HttpResponse("No file uploaded.", status_code=400)

        df = pd.read_csv(io.BytesIO(file.read()))
        logging.info(f"Successfully read CSV with {df.shape[0]} rows.")

        expected_features = model_meta['features']
        if not all(feature in df.columns for feature in expected_features):
            missing_cols = set(expected_features) - set(df.columns)
            return func.HttpResponse(f"Missing required columns: {missing_cols}", status_code=400)
        
        df_predict = df[expected_features]
        
        probabilities = model.predict(df_predict)

        # --- NEW Response Formatting ---
        # Add the probability score to every row in the original dataframe
        df_results = df.copy()
        df_results['fraud_probability'] = probabilities
        total_rows = len(df_results)
        
        # The new response sends ALL transactions with their scores
        # The frontend will be responsible for filtering and summarizing
        response_data = {
            "total_rows": total_rows,
            "predictions": df_results.to_dict(orient='records')
        }

        return func.HttpResponse(
            body=json.dumps(response_data, indent=4),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"An error occurred during prediction: {e}")
        return func.HttpResponse(
             "An error occurred processing your request. Check logs for details.",
             status_code=500
        )