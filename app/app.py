from enum import Enum
import json, os

class AppMode(Enum):
    WEB = "WEB"
    LOCAL = "LOCAL"
    DEV = "DEV"

config = json.load(open(os.path.dirname(__file__) + "/../config.json"))

if 'APP_MODE' not in config:
    print("Warning: No APP_MODE in config.json")

_root = {
    AppMode.WEB: config['WEB_PATH'] + 'pla-multi-checker-web-fix/',
    AppMode.LOCAL: './pla-multi-checker-web-fix/',
    AppMode.DEV: './pla-multi-checker-web-fix/'
}


APP_MODE = AppMode(config['APP_MODE'])
ROOT_PATH = _root[APP_MODE]
RESOURCE_PATH = ROOT_PATH + 'static/'