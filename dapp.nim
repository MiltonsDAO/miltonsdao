import htmlgen
import jester
import json
import re
import os


settings:
    bindAddr = "0.0.0.0"
    port = Port(3824)
    staticDir = getCurrentDir() / "out"

routes:
    get re"/(.*)":
        cond request.matches[0].splitFile.ext == ""
        resp(Http200, {"Content-Type":"text/html"}, readFile("out/index.html"))
