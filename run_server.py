import os
import sys
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

# Configure paths
os.chdir(r"e:\my files\Travel Planner Agent")
sys.path.insert(0, r"e:\my files\Travel Planner Agent")

from backend.main import app
frontend_dist = r"e:\my files\Travel Planner Agent\frontend\dist"

class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        try:
            response = await super().get_response(path, scope)
            if response.status_code == 404:
                return FileResponse(f"{frontend_dist}/index.html")
            return response
        except Exception as e:
            if path.startswith("api/"):
                raise e
            return FileResponse(f"{frontend_dist}/index.html")

# Mount frontend
app.mount("/", SPAStaticFiles(directory=frontend_dist, html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
