<?php
// Supprime les fichiers de cache Laravel
$files = [
    __DIR__ . '/../bootstrap/cache/config.php',
    __DIR__ . '/../bootstrap/cache/services.php',
    __DIR__ . '/../bootstrap/cache/packages.php',
    __DIR__ . '/../bootstrap/cache/routes-v7.php',
];

foreach ($files as $f) {
    if (file_exists($f)) {
        unlink($f);
        echo "Supprimé: $f\n";
    } else {
        echo "Déjà absent: $f\n";
    }
}
echo "Cache vidé !";
