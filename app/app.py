from enum import Enum

class AppMode(Enum):
    WEB = "WEB"
    LOCAL = "LOCAL"
    DEV = "DEV"

_root = {
    AppMode.WEB: '/home/pla-multi-checker-web-fix/static/',
    AppMode.LOCAL: './pla-multi-checker-web-fix/',
    AppMode.DEV: './pla-multi-checker-web-fix/'
}

_resources = {
    AppMode.WEB: '/home/pla-multi-checker-web/static/',
    AppMode.LOCAL: './pla-multi-checker-web-fix/static/',
    AppMode.DEV: './static/'
}

APP_MODE = AppMode.LOCAL
RESOURCE_PATH = _resources[APP_MODE]
ROOT_PATH = _root[APP_MODE]