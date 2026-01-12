export default function Footer() {
    return (
        <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} ESHOP Admin. Tất cả bản quyền được bảo hộ.
            </p>
        </footer>
    );
}