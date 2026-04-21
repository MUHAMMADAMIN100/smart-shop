export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 grid gap-6 md:grid-cols-3 text-sm text-slate-600">
        <div>
          <div className="font-bold text-slate-900 text-base mb-2">PhoneMarket</div>
          <p>Смартфоны ведущих брендов с быстрой доставкой.</p>
        </div>
        <div>
          <div className="font-semibold text-slate-900 mb-2">Помощь</div>
          <ul className="space-y-1">
            <li>Доставка и оплата</li>
            <li>Возврат и обмен</li>
            <li>Гарантия</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-slate-900 mb-2">Контакты</div>
          <ul className="space-y-1">
            <li>+7 (000) 000-00-00</li>
            <li>support@phonemarket.ru</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} PhoneMarket
      </div>
    </footer>
  );
}
