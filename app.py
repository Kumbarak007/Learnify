from flask import Flask, render_template
from routes.explain import explain_bp
from routes.quiz import quiz_bp
from routes.flashcards import flashcard_bp
from routes.followup import chat_bp

app = Flask(__name__)

# Register Blueprints
app.register_blueprint(explain_bp)
app.register_blueprint(quiz_bp)
app.register_blueprint(flashcard_bp)
app.register_blueprint(chat_bp)

@app.route("/")
def home():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)