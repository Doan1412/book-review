from __future__ import print_function

from auth import auth_bp
from book import book_bp
from category import category_bp
from utils import get_app

app = get_app()

app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
app.register_blueprint(book_bp, url_prefix="/api/v1/book")
app.register_blueprint(category_bp, url_prefix="/api/v1/category")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000, threaded=True)
