export default function Footer() {
    return (
        <footer className="w-full bg-white border-t border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500">
                &copy; {new Date().getFullYear()} ESHOP Admin. Tất cả bản quyền được bảo hộ.
            </p>
        </footer>
    );
}