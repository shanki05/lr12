$(document).ready(function () {
    const vocabularyByLevel = {
        beginner: [
            { en: "always", ua: ["завжди"] },
            { en: "apple", ua: ["яблуко"] },
            { en: "book", ua: ["книга", "книжка"] },
            { en: "friend", ua: ["друг", "подруга"] },
            { en: "water", ua: ["вода"] },
            { en: "house", ua: ["дім", "будинок"] },
            { en: "time", ua: ["час"] },
            { en: "work", ua: ["робота", "праця"] },
            { en: "happy", ua: ["щасливий", "радісний"] },
            { en: "learn", ua: ["вчити", "вивчати", "навчатися"] }
        ],
        intermediate: [
            { en: "achieve", ua: ["досягати", "досягти"] },
            { en: "opportunity", ua: ["можливість", "нагода", "шанс"] },
            { en: "reliable", ua: ["надійний", "перевірений"] },
            { en: "improve", ua: ["покращувати", "покращити", "поліпшувати", "вдосконалювати"] },
            { en: "challenge", ua: ["виклик", "випробування", "складне завдання"] },
            { en: "curious", ua: ["цікавий", "допитливий"] },
            { en: "experience", ua: ["досвід", "переживання"] },
            { en: "discover", ua: ["відкривати", "відкрити", "виявляти", "дізнаватися"] },
            { en: "confident", ua: ["впевнений", "упевнений"] },
            { en: "purpose", ua: ["мета", "ціль", "призначення"] }
        ],
        advanced: [
            { en: "ambiguous", ua: ["двозначний", "невизначений", "неоднозначний"] },
            { en: "consequence", ua: ["наслідок", "результат"] },
            { en: "inevitable", ua: ["неминучий", "невідворотний"] },
            { en: "perseverance", ua: ["наполегливість", "стійкість", "завзятість"] },
            { en: "scrutinize", ua: ["ретельно вивчати", "досліджувати", "перевіряти"] },
            { en: "substantiate", ua: ["обґрунтовувати", "підтверджувати"] },
            { en: "ubiquitous", ua: ["повсюдний", "всюдисущий"] },
            { en: "resilient", ua: ["стійкий", "гнучкий", "життєстійкий"] },
            { en: "elaborate", ua: ["детальний", "складний", "продуманий"] },
            { en: "ephemeral", ua: ["швидкоплинний", "короткочасний", "ефемерний"] }
        ]
    };

    const difficultyNames = {
        beginner: "Початковий",
        intermediate: "Середній",
        advanced: "Високий"
    };

    let currentDifficulty = "beginner";
    let sessionCards = [];
    let currentIndex = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let isTransitioning = false;

    function shuffleArray(array) {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function getSelectedDifficulty() {
        const $checked = $('input[name="difficulty"]:checked');
        const value = $checked.val();

        if (!value || !Object.prototype.hasOwnProperty.call(vocabularyByLevel, value)) {
            $('input[name="difficulty"][value="beginner"]').prop("checked", true);
            return "beginner";
        }

        return value;
    }

    function updateDifficultyUI(level) {
        $(".difficulty-option").removeClass("active");
        $(`input[name="difficulty"][value="${level}"]`)
            .closest(".difficulty-option")
            .addClass("active");
    }

    function initGame() {
        currentDifficulty = getSelectedDifficulty();
        updateDifficultyUI(currentDifficulty);

        const wordList = vocabularyByLevel[currentDifficulty];
        const shuffled = shuffleArray(wordList);

        sessionCards = shuffled.map(item => ({
            en: item.en,
            ua: item.ua,
            userAnswer: "",
            status: "pending"
        }));

        currentIndex = 0;
        correctCount = 0;
        wrongCount = 0;
        isTransitioning = false;

        updateStats();
        renderCard();
        $("#result-modal").fadeOut(200);
    }

    function renderCard() {
        const card = sessionCards[currentIndex];
        const total = sessionCards.length;

        $("#word-display").text(card.en);
        $("#step-counter").text(`${currentIndex + 1}/${total}`);

        $("#prev-btn").prop("disabled", currentIndex === 0);
        $("#next-btn").prop("disabled", currentIndex === total - 1);

        $("#validation-msg").text("");
        $("#translation-input").removeClass("input-error");

        const $cardEl = $("#word-card");
        $cardEl.removeClass("correct wrong");

        if (card.status === "pending") {
            $("#translation-input")
                .val(card.userAnswer)
                .prop("disabled", false)
                .focus();
            $("#card-hint").text("Впишіть переклад та натисніть на картку");
        } else if (card.status === "correct") {
            $cardEl.addClass("correct");
            $("#translation-input")
                .val(card.userAnswer)
                .prop("disabled", true);
            $("#card-hint").text("Вірно!");
        } else if (card.status === "wrong") {
            $cardEl.addClass("wrong");
            $("#translation-input")
                .val(card.userAnswer)
                .prop("disabled", true);
            $("#card-hint").text(`Невірно! Правильно: ${card.ua[0]}`);
        }
    }

    function updateStats() {
        $("#correct-count").text(correctCount);
        $("#wrong-count").text(wrongCount);
    }

    function validateInput(rawText) {
        const trimmed = rawText.trim();

        if (trimmed.length === 0) {
            return { valid: false, message: "Поле не може бути порожнім!" };
        }

        const ukrainianRegex = /^[а-яіїєґА-ЯІЇЄҐ\s'-]+$/;
        if (!ukrainianRegex.test(trimmed)) {
            return { valid: false, message: "Введіть переклад українськими літерами!" };
        }

        return { valid: true, value: trimmed };
    }

    function getProficiencyLevel(score, total) {
        const percent = Math.round((score / total) * 100);
        if (percent >= 90) {
            return { level: "Високий (Advanced)", percent };
        } else if (percent >= 70) {
            return { level: "Середній (Intermediate)", percent };
        } else if (percent >= 50) {
            return { level: "Базовий (Elementary)", percent };
        } else {
            return { level: "Початковий (Beginner)", percent };
        }
    }

    function showResultModal() {
        const total = sessionCards.length;
        const result = getProficiencyLevel(correctCount, total);
        const difficultyLabel = difficultyNames[currentDifficulty];

        $("#knowledge-level").text(`Рівень знань: ${result.level}`);
        $("#modal-summary").html(
            `Рівень складності: <strong>${difficultyLabel}</strong><br>` +
            `Ви надали <strong>${correctCount}</strong> правильних відповідей із <strong>${total}</strong> (${result.percent}%).<br>` +
            `Помилок: <strong>${wrongCount}</strong>.`
        );

        $("#result-modal").css("display", "flex").hide().fadeIn(250);
    }

    function checkAnswer() {
        if (isTransitioning) return;

        const currentCard = sessionCards[currentIndex];
        if (currentCard.status !== "pending") {
            return;
        }

        const rawInput = $("#translation-input").val();
        const validation = validateInput(rawInput);

        if (!validation.valid) {
            $("#translation-input").addClass("input-error").focus();
            $("#validation-msg").text(validation.message);
            return;
        }

        $("#translation-input").removeClass("input-error");
        $("#validation-msg").text("");

        const userAnswer = validation.value;
        const normalizedAnswer = userAnswer.toLowerCase();
        const isCorrect = currentCard.ua.includes(normalizedAnswer);

        currentCard.userAnswer = userAnswer;

        if (isCorrect) {
            currentCard.status = "correct";
            correctCount++;
        } else {
            currentCard.status = "wrong";
            wrongCount++;
        }

        updateStats();
        renderCard();

        const allAnswered = sessionCards.every(card => card.status !== "pending");

        isTransitioning = true;
        setTimeout(function () {
            isTransitioning = false;
            if (allAnswered) {
                showResultModal();
            } else {
                const nextPendingIndex = sessionCards.findIndex(
                    (card, idx) => idx > currentIndex && card.status === "pending"
                );
                if (nextPendingIndex !== -1) {
                    currentIndex = nextPendingIndex;
                } else {
                    const firstPendingIndex = sessionCards.findIndex(
                        card => card.status === "pending"
                    );
                    if (firstPendingIndex !== -1) {
                        currentIndex = firstPendingIndex;
                    }
                }
                renderCard();
            }
        }, 900);
    }

    $('input[name="difficulty"]').on("change", function () {
        initGame();
    });

    $("#word-card").on("click", function () {
        checkAnswer();
    });

    $("#word-card").on("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            checkAnswer();
        }
    });

    $("#translation-input").on("keypress", function (e) {
        if (e.which === 13) {
            e.preventDefault();
            checkAnswer();
        }
    });

    $("#translation-input").on("input", function () {
        $(this).removeClass("input-error");
        $("#validation-msg").text("");
    });

    $("#prev-btn").on("click", function () {
        if (currentIndex > 0 && !isTransitioning) {
            currentIndex--;
            renderCard();
        }
    });

    $("#next-btn").on("click", function () {
        if (currentIndex < sessionCards.length - 1 && !isTransitioning) {
            currentIndex++;
            renderCard();
        }
    });

    $("#restart-btn").on("click", function () {
        initGame();
    });

    $("#close-modal-btn").on("click", function () {
        $("#result-modal").fadeOut(200);
    });

    initGame();
});