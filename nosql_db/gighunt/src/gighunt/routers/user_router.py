import datetime
import time
from collections import Counter

from fastapi import APIRouter, Response

from gighunt.modules.models import UserAuthorization, UserRegistration
from gighunt.modules.use_cases.user_use_cases import UserUseCases
from gighunt.modules.models import GroupAnnouncement, Star, UserAnnouncement, Comment, UpdateUser, FilterUser

class UserRouter:
    def __init__(self, router: APIRouter, use_cases: UserUseCases) -> None:
        self._router = router
        self._use_cases = use_cases
        self._router.add_api_route(
            "/api/authorization", self._authorization, methods=["POST"], tags=["User"]
        )
        self._router.add_api_route(
            "/api/registration", self._registration, methods=["POST"], tags=["User"]
        )
        self._router.add_api_route(
            "/api/user/{user_id}", self._get_user, methods=["GET"], tags=["User"]
        )
        self._router.add_api_route(
            "/api/users",
            self._get_users,
            methods=["POST"],
            tags=["User"],
        )
        self._router.add_api_route(
            "/api/get_user_star",
            self._get_is_user_star,
            methods=["GET"],
            tags=["User"]
        )
        self._router.add_api_route(
            "/api/user_star", self._add_star, methods=["POST"], tags=["User"]
        )
        self._router.add_api_route(
            "/api/static_all", self._get_static_field, methods=["GET"], tags=["Static"]
        )
        self._router.add_api_route(
            "/api/popular_user", self._get_popular_user, methods=["GET"], tags=["Stats"]
        )
        self._router.add_api_route(
            "/api/update_user", self._update_user, methods=["PUT"], tags=["User"]
        )

    def _authorization(self, user_authorization: UserAuthorization) -> Response:
        return self._use_cases.try_authorization(user_authorization)

    def _registration(self, user_registration: UserRegistration) -> Response:
        return self._use_cases.registration(user_registration)

    def _get_users(self, page: int, page_size: int, filters: FilterUser) -> Response:
        """
        POST /api/users
        {
            page: int,
            page_size: int
            filters: FilterUser
        }
        Response:
        [
            {
                user: User,
                start: stars
            },
            ...
        ]
        """
        print(filters)
        return self._use_cases.get_users(page, page_size, filters)

    def _get_user(self, user_id: int) -> Response:
        """
        GET /api/user?user_id=<userId>

        Response:
        {
            user: User,
            stars: Number,
            groups: [
                {
                    group: Group,
                    join_date: Date
                },
                ...
            ],
            announcements: [
                {
                    announcement: Announcement,
                    stars: Number
                },
                ...
            ]
        }
        """
        return self._use_cases.get_user(user_id)

    def _get_is_user_star(self, source_user_id: int, dest_user_id: int) ->Response:
        """
        GET /api/get_user_star?user_id=<UserId>
        :param source_user_id: int
        :param dest_user_id: int
        :return:
        Response:
        {
            value: bool
        }
        """
        return self._use_cases.get_is_user_star(source_user_id, dest_user_id)


    def _add_star(self, star: Star) -> Response:
        """
        POST /api/user_star

        {
            from: String,
            to: String
        }
        """
        return self._use_cases.add_star(star)

    def _get_static_field(self, static_field:str)->Response:
        """
        Get /api/static_all?static_field=<staticField>
        :return:
        {
            data: []
        }
        """
        return self._use_cases.get_static_field(static_field)

    def _update_user(self, update_user:UpdateUser):
        '''
        PUT /api/update_user
        :param update_user: UpdateUser
        :return:
        {
            code: int,
            status: str,
            user: User
        }
        '''
        return self._use_cases.update_user(update_user)

    def _get_popular_user(self):
        """

        :return:
        Response:
        {
            status: int,
            message: string
            user: User|None
        }
        """
        return self._use_cases.get_popular_user()
