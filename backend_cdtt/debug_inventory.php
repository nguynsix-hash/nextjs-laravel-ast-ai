<?php
try {
    echo "Testing Controller Instantiation...\n";
    if (class_exists(\App\Http\Controllers\Api\InventoryLogController::class)) {
        echo "Class exists.\n";
        $controller = new \App\Http\Controllers\Api\InventoryLogController();
        echo "Controller instantiated.\n";
        
        $request = \Illuminate\Http\Request::create('/api/inventory-logs', 'GET');
        $response = $controller->index($request);
        echo "Response Status: " . $response->status() . "\n";
    } else {
        echo "Class NOT found!\n";
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
