// import { useMemo, useState } from "react";
// import { cars } from "@/mockdata";
// import { Header } from "@/components/header";

// export default function Cars() {
//   const [query, setQuery] = useState("");
//   const [sortBy, setSortBy] = useState("popular");

//   const filteredAndSortedCars = useMemo(() => {
//     const normalizedQuery = query.trim().toLowerCase();
//     const filtered = cars.filter((car) => {
//       if (!normalizedQuery) return true;
//       const hay = `${car.make} ${car.model} ${car.color}`.toLowerCase();
//       return hay.includes(normalizedQuery);
//     });

//     const sorted = [...filtered].sort((a, b) => {
//       switch (sortBy) {
//         case "priceAsc":
//           return a.price - b.price;
//         case "priceDesc":
//           return b.price - a.price;
//         case "yearDesc":
//           return b.year - a.year;
//         case "mileageAsc":
//           return a.mileage_km - b.mileage_km;
//         case "popular":
//         default:
//           if (b.year !== a.year) return b.year - a.year;
//           if (a.mileage_km !== b.mileage_km) return a.mileage_km - b.mileage_km;
//           return a.price - b.price;
//       }
//     });

//     return sorted;
//   }, [query, sortBy]);

//   const formatPrice = (num) => num.toLocaleString();
//   const formatMileage = (km) => `${km.toLocaleString()} км`;

//   const renderStars = (rating) => {
//     const full = Math.floor(rating);
//     const empty = 5 - full;
//     return (
//       <span aria-label={`Rating ${rating} out of 5`} className="text-yellow-500">
//         {"★".repeat(full)}
//         {"☆".repeat(empty)}
//       </span>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <header className="bg-linear-to-r from-blue-600 to-purple-600 text-white py-12 px-6">
//         <Header />
//       </header>
//       <main className="max-w-7xl mx-auto py-12 px-6">
//         <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Хайх: Марк, загвар, өнгө..."
//             className="w-full md:w-1/2 rounded-lg border border-foreground/20 bg-white/70 dark:bg-black/30 backdrop-blur px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />

//           <div className="flex items-center gap-2">
//             <label htmlFor="sort" className="text-sm opacity-80">
//               Эрэмбэлэх:
//             </label>
//             <select
//               id="sort"
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="rounded-lg border border-foreground/20 bg-white/70 dark:bg-black/30 backdrop-blur px-3 py-2"
//             >
//               <option value="popular">Шинэ, бага явсан</option>
//               <option value="priceAsc">Үнэ (бага → их)</option>
//               <option value="priceDesc">Үнэ (их → бага)</option>
//               <option value="yearDesc">Үйлдвэрлэсэн он (шинэ → хуучин)</option>
//               <option value="mileageAsc">Гүйлт (бага → их)</option>
//             </select>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredAndSortedCars.map((car) => (
//             <div
//               key={car.id}
//               className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
//             >
//               <div className="relative">
//                 <img src={car.image} alt={`${car.make} ${car.model}`} className="w-full h-48 object-cover" />
//                 <div className="absolute top-3 left-3 flex gap-2">
//                   <span className="rounded-md bg-black/60 text-white text-xs px-2 py-1 backdrop-blur">{car.year}</span>
//                   <span className="rounded-md bg-black/60 text-white text-xs px-2 py-1 backdrop-blur">{car.color}</span>
//                 </div>
//               </div>
//               <div className="p-6">
//                 <h3 className="text-xl font-bold mb-2 text-foreground">
//                   {car.make} {car.model}
//                 </h3>
//                 <p className="text-gray-600 dark:text-gray-300 mb-4">{car.description}</p>
//                 <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
//                   <div className="rounded-md border border-foreground/10 px-3 py-2">
//                     <div className="opacity-60">Гүйлт</div>
//                     <div className="font-semibold">{formatMileage(car.mileage_km)}</div>
//                   </div>
//                   <div className="rounded-md border border-foreground/10 px-3 py-2">
//                     <div className="opacity-60">Хроп</div>
//                     <div className="font-semibold">{car.transmission}</div>
//                   </div>
//                   <div className="rounded-md border border-foreground/10 px-3 py-2">
//                     <div className="opacity-60">Хөдөлгүүр</div>
//                     <div className="font-semibold">{car.engine}</div>
//                   </div>
//                   <div className="rounded-md border border-foreground/10 px-3 py-2">
//                     <div className="opacity-60">Үнэлгээ</div>
//                     <div className="font-semibold">{renderStars(car.rating)}</div>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between mb-4">
//                   <div className="text-sm opacity-80">Үнэ</div>
//                   <div className="text-green-600 font-semibold text-lg">{formatPrice(car.price)} ₮</div>
//                 </div>
//                 <button
//                   onClick={() => window.open("https://www.facebook.com/arvai.autotrade", "_blank")}
//                   className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
//                 >
//                   Холбогдох
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </main>
//     </div>
//   );
// }
export default function Cars() {
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Coming soon...</h1>
    </div>
  );
}
