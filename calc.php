<?php
// api/calc.php - clean version
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'POST only']);
    exit;
}

$age = isset($_POST['age']) ? (int) $_POST['age'] : 0;
$gender = isset($_POST['gender']) ? trim($_POST['gender']) : '';
$weight = isset($_POST['weight']) ? (float) $_POST['weight'] : 0.0;
$height = isset($_POST['height']) ? (float) $_POST['height'] : 0.0;
$activity = isset($_POST['activity']) ? (float) $_POST['activity'] : 0.0;

if (!$age || $gender === '' || !$weight || !$height || !$activity) {
    echo json_encode(['error' => 'Missing or invalid fields']);
    exit;
}

if ($gender === 'male') {
    $bmr = 10 * $weight + 6.25 * $height - 5 * $age + 5;
} else {
    $bmr = 10 * $weight + 6.25 * $height - 5 * $age - 161;
}

$maintenance = (int) round($bmr * $activity);

echo json_encode([
    'maintenance' => $maintenance,
    'loss' => $maintenance - 500,
    'gain' => $maintenance + 500
]);
exit;
