
const input = document.getElementById("numberInput");
const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const playBtn = document.getElementById("playBtn");

const arrayView = document.getElementById("arrayView");
const arrayCount = document.getElementById("arrayCount");
const stepTitle = document.getElementById("stepTitle");
const phaseBadge = document.getElementById("phaseBadge");
const stepCounter = document.getElementById("stepCounter");
const explanation = document.getElementById("explanation");

let steps = [];
let currentStep = -1;
let playTimer = null;

// Generate the array entered by the user
generateBtn.addEventListener("click", generateArray);

input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        generateArray();
    }
});

function generateArray() {
    stopAutoPlay();

    const text = input.value.trim();

    if (text === "") {
        alert("Please enter some numbers first.");
        input.focus();
        return;
    }

    const parts = text.split(/[\s,]+/);

    if (parts.length > 16) {
        alert("Please enter at most 16 numbers.");
        return;
    }

    if (parts.some(part => !/^[+-]?\d+$/.test(part))) {
        alert("Please enter valid integers separated by commas or spaces.");
        return;
    }

    const numbers = parts.map(Number);

    if (numbers.some(number => !Number.isSafeInteger(number))) {
        alert("Please enter valid integers within the safe number range.");
        return;
    }

    steps = [];
    currentStep = -1;

    arrayCount.textContent =
        `${numbers.length} number${numbers.length === 1 ? "" : "s"}`;

    saveStep(
        numbers,
        "Original Array",
        "This is your original array. Merge sort will divide it into smaller parts.",
        [],
        "READY"
    );

    mergeSort(numbers.slice(), 0, numbers.length - 1);

    currentStep = 0;
    renderStep();
}

// Save each stage of the algorithm
function saveStep(array, title, description, active = [], phase = "DIVIDE") {
    steps.push({
        array: array.slice(),
        title,
        description,
        active: active.slice(),
        phase
    });
}

// Divide the array into smaller sections
function mergeSort(array, left, right) {
    if (left >= right) {
        return;
    }

    const mid = Math.floor((left + right) / 2);

    saveStep(
        array,
        "Divide the Array",
        `Divide the section from index ${left} to ${right} into two parts.`,
        Array.from(
            { length: right - left + 1 },
            (_, i) => left + i
        ),
        "DIVIDE"
    );

    mergeSort(array, left, mid);
    mergeSort(array, mid + 1, right);

    merge(array, left, mid, right);
}

// Merge two sorted sections
function merge(array, left, mid, right) {
    const leftPart = array.slice(left, mid + 1);
    const rightPart = array.slice(mid + 1, right + 1);

    let i = 0;
    let j = 0;
    let k = left;

    saveStep(
        array,
        "Merge Sorted Sections",
        `Merge [${leftPart.join(", ")}] and [${rightPart.join(", ")}] in ascending order.`,
        Array.from(
            { length: right - left + 1 },
            (_, n) => left + n
        ),
        "MERGE"
    );

    while (i < leftPart.length && j < rightPart.length) {
        if (leftPart[i] <= rightPart[j]) {
            array[k] = leftPart[i];
            i++;
        } else {
            array[k] = rightPart[j];
            j++;
        }

        k++;

        saveStep(
            array,
            "Compare and Place",
            `The merged section is now [${array.slice(left, k).join(", ")}].`,
            Array.from({ length: k - left }, (_, n) => left + n),
            "MERGE"
        );
    }

    while (i < leftPart.length) {
        array[k] = leftPart[i];
        i++;
        k++;

        saveStep(
            array,
            "Copy Remaining Values",
            `Copy the remaining left-side values. The section is now [${array.slice(left, k).join(", ")}].`,
            Array.from({ length: k - left }, (_, n) => left + n),
            "MERGE"
        );
    }

    while (j < rightPart.length) {
        array[k] = rightPart[j];
        j++;
        k++;

        saveStep(
            array,
            "Copy Remaining Values",
            `Copy the remaining right-side values. The section is now [${array.slice(left, k).join(", ")}].`,
            Array.from({ length: k - left }, (_, n) => left + n),
            "MERGE"
        );
    }

    saveStep(
        array,
        "Section Sorted!",
        `This section is now sorted: [${array.slice(left, right + 1).join(", ")}].`,
        Array.from(
            { length: right - left + 1 },
            (_, n) => left + n
        ),
        "SORTED"
    );
}

// Display the current step
function renderStep() {
    if (currentStep < 0 || currentStep >= steps.length) {
        return;
    }

    const step = steps[currentStep];

    stepTitle.textContent = step.title;
    explanation.textContent = step.description;
    phaseBadge.textContent = step.phase;
    stepCounter.textContent = `STEP ${currentStep + 1} / ${steps.length}`;

    arrayView.replaceChildren();

    step.array.forEach((number, index) => {
        const cell = document.createElement("div");
        cell.className = "array-cell";
        cell.textContent = number;

        if (step.active.includes(index)) {
            if (step.phase === "SORTED") {
                cell.classList.add("sorted");
            } else {
                cell.classList.add("active");
            }
        }

        arrayView.appendChild(cell);
    });

    prevBtn.disabled = currentStep === 0;
    nextBtn.disabled = currentStep === steps.length - 1;
    playBtn.disabled = currentStep === steps.length - 1;

    if (currentStep === steps.length - 1) {
        stepTitle.textContent = "🎉 Array Completely Sorted!";
        phaseBadge.textContent = "COMPLETE";
        explanation.textContent =
            `Sorting finished! Final sorted array: [${step.array.join(", ")}].`;
        stopAutoPlay();
    }
}

// Go to the next step
nextBtn.addEventListener("click", function () {
    if (currentStep < steps.length - 1) {
        currentStep++;
        renderStep();
    }
});

// Go to the previous step
prevBtn.addEventListener("click", function () {
    if (currentStep > 0) {
        currentStep--;
        renderStep();
    }
});

// Automatically play the sorting steps
playBtn.addEventListener("click", function () {
    if (playTimer !== null) {
        stopAutoPlay();
        return;
    }

    if (currentStep >= steps.length - 1) {
        return;
    }

    playBtn.textContent = "Ⅱ Pause";

    playTimer = setInterval(function () {
        if (currentStep < steps.length - 1) {
            currentStep++;
            renderStep();
        } else {
            stopAutoPlay();
        }
    }, 900);
});

// Stop automatic playback
function stopAutoPlay() {
    if (playTimer !== null) {
        clearInterval(playTimer);
        playTimer = null;
    }

    playBtn.textContent = "▶ Auto Play";
}

// Reset the visualizer
resetBtn.addEventListener("click", function () {
    stopAutoPlay();

    steps = [];
    currentStep = -1;

    input.value = "";
    arrayCount.textContent = "0 numbers";
    stepTitle.textContent = "Ready to sort?";
    phaseBadge.textContent = "READY";
    stepCounter.textContent = "STEP 0 / 0";
    explanation.textContent =
        "Enter your numbers and generate an array to begin.";

    arrayView.replaceChildren();

    const message = document.createElement("p");
    message.textContent = "Enter your numbers above to begin.";
    arrayView.appendChild(message);

    prevBtn.disabled = true;
    nextBtn.disabled = true;
    playBtn.disabled = true;

    input.focus();
});
