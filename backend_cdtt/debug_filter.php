<?php
$attributes = \App\Models\Attribute::all();
$data = [];

echo "Total Attributes: " . $attributes->count() . "\n";

foreach ($attributes as $attr) {
    echo "Checking Attribute: " . $attr->name . " (ID: " . $attr->id . ")\n";
    
    // Check raw ProductAttributes
    $allVals = \App\Models\ProductAttribute::where('attribute_id', $attr->id)->count();
    echo "  - Total entries in product_attributes: " . $allVals . "\n";

    // Check with active product constraint
    $values = \App\Models\ProductAttribute::where('attribute_id', $attr->id)
        ->whereHas('product', function ($q) {
            $q->where('status', 1); 
        })
        ->select('value')
        ->distinct()
        ->pluck('value');
    
    echo "  - Distinct values in ACTIVE products: " . $values->count() . "\n";
    
    if ($values->count() > 0) {
        $data[] = [
            'id' => $attr->id,
            'name' => $attr->name,
            'values' => $values
        ];
    }
}

echo "Final Data Preview:\n";
print_r($data);
