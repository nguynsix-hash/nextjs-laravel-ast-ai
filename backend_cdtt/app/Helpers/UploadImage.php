<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UploadImage
{
    public static function upload(UploadedFile $file, $folder = 'products')
    {
        $path = $file->store("public/uploads/$folder");
        return Storage::url(str_replace('public/', '', $path));
    }

    public static function delete($fileUrl)
    {
        $path = str_replace('/storage/', 'public/', $fileUrl);
        if (Storage::exists($path)) {
            Storage::delete($path);
        }
    }
}
