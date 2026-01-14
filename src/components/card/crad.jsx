import { Card } from "flowbite-react";
import { Home, Package, Layers } from "lucide-react";

export default function CardComponent({ title, count, icon: Icon , color = "bg-gray-100", iconColor = 'text-gray-700'}) {
  return (
    <Card href="#" className="group max-w-sm">

      <div className="flex items-center space-x-4">

        <div className="flex-1 space-y-3">
          <h5 className="text-base text-gray-700">
            {title}
          </h5>
          <p className="font-bold text-3xl text-gray-700">{count}</p>
        </div>

        <div className={`p-3 rounded-full bg-gray-100 group-hover:bg-white flex-shrink-0 ${color}`} >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
}

