from fastapi import APIRouter

from app.routes.analysis import router as analysis_router
from app.routes.files import router as files_router
from app.routes.insights import router as insights_router
from app.routes.job_exports import router as job_exports_router
from app.routes.jobs import router as jobs_router

API_V1_PREFIX = "/api/v1"

router = APIRouter(prefix=API_V1_PREFIX)
router.include_router(files_router)
router.include_router(jobs_router)
router.include_router(job_exports_router)
router.include_router(analysis_router)
router.include_router(insights_router)
