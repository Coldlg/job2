import { cars } from "@/generated/prisma";

export function CarCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car) => (
        <div
          key={car.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="relative">
            <img src={car.image} alt={`${car.make} ${car.model}`} className="w-full h-48 object-cover" />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="rounded-md bg-black/60 text-white text-xs px-2 py-1 backdrop-blur">{car.year}</span>
              <span className="rounded-md bg-black/60 text-white text-xs px-2 py-1 backdrop-blur">{car.color}</span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-foreground">
              {car.make} {car.model}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{car.description}</p>
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="rounded-md border border-foreground/10 px-3 py-2">
                <div className="opacity-60">Гүйлт</div>
                <div className="font-semibold">{formatMileage(car.mileage_km)}</div>
              </div>
              <div className="rounded-md border border-foreground/10 px-3 py-2">
                <div className="opacity-60">Хроп</div>
                <div className="font-semibold">{car.transmission}</div>
              </div>
              <div className="rounded-md border border-foreground/10 px-3 py-2">
                <div className="opacity-60">Хөдөлгүүр</div>
                <div className="font-semibold">{car.engine}</div>
              </div>
              <div className="rounded-md border border-foreground/10 px-3 py-2">
                <div className="opacity-60">Үнэлгээ</div>
                <div className="font-semibold">{renderStars(car.rating)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="text-sm opacity-80">Үнэ</div>
              <div className="text-green-600 font-semibold text-lg">{formatPrice(car.price)} ₮</div>
            </div>
            <button
              onClick={() => window.open("https://www.facebook.com/arvai.autotrade", "_blank")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Холбогдох
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
