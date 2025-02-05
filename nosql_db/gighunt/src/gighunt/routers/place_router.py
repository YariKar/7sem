import datetime
import time

from fastapi import APIRouter, Response

from gighunt.modules.models import Place, FilterPlace
from gighunt.modules.use_cases.place_use_cases import PlaceUseCases


class PlaceRouter:
    def __init__(self, router: APIRouter, use_cases: PlaceUseCases) -> None:
        self._router = router
        self._use_cases = use_cases
        self._router.add_api_route(
            "/api/places",
            self._get_places,
            methods=["POST"],
            tags=["Place"],
        )
        self._router.add_api_route(
            "/api/place", self._add_place, methods=["POST"], tags=["Place"]
        )
        self._router.add_api_route(
            "/api/get_place", self._get_place, methods=["GET"], tags=["Place"]
        )

    def _get_places(self, page: int, page_size: int, filters: FilterPlace) -> Response:
        """
        Post /api/places

        Response:
        [
            Place,
            ...
        ]
        """
        return self._use_cases.get_places(page,page_size, filters)

    def _add_place(self, place: Place) -> Response:
        """
        POST /api/place

        Request:
        {
            name: String,
            type: String,
            address: String,
            phone_number: String
        }
        """
        return self._use_cases.add_place(place)

    def _get_place(self, place_id: int):
        return self._use_cases.get_place(place_id)
