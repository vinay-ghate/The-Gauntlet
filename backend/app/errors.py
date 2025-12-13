from fastapi import HTTPException, status

class AppError(Exception):
    def __init__(self, code: str, detail: str, status_code: int = 400):
        self.code = code
        self.detail = detail
        self.status_code = status_code

class AuthError(AppError):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(code="AUTH_ERROR", detail=detail, status_code=status.HTTP_401_UNAUTHORIZED)

class ServerError(AppError):
    def __init__(self, detail: str, status_code: int = 500):
        super().__init__(code="SERVER_ERROR", detail=detail, status_code=status_code)
