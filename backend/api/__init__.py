# backend/api/__init__.py
from .tryon import router as tryon_router
from .products import router as products_router

__all__ = ["tryon_router", "products_router"]
