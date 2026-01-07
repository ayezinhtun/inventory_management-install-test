import { useEffect, useState } from "react";
import CardComponent from "../components/card/crad";
import { CirclePlus, Delete, Download, Edit, ListFilter, MapPin, Pen, Save, Search, Trash2, User } from "lucide-react"
import Pagination from "../components/pagination/pagination";
import { Checkbox, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Dropdown, DropdownItem } from "flowbite-react";
import { useUserProfiles } from "../context/UserProfileContext";
import { getWarehouse } from "../context/WarehouseContext";
import { getRegion } from "../context/RegionContext";
import { supabase } from "../../supabase/supabase-client";

export default function UserMangement() {

    const { users, updateUserRole, deleteUser } = useUserProfiles();

    const [regions, setRegions] = useState([]);

    const [warehouses, setWarehouses] = useState([]);

    // for search in the input search
    const [searchItem, setSearchItem] = useState("");

    // for filter
    const [showFilter, setShowFilter] = useState(false);
    const [nameFilter, setNameFilter] = useState("");

    const [roleChanges, setRoleChanges] = useState({});

    const [userRegions, setUserRegions] = useState({});

    const [userWarehouses, setUserWarehouses] = useState({});


    //for fetch region
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const data = await getRegion();
                setRegions(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchRegions();
    }, [])

    //for fetch warheouse
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const data = await getWarehouse();
                setWarehouses(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchWarehouses();
    }, [])

    useEffect(() => {
        const fetchUserWarehouses = async () => {
            try {
                const { data, error } = await supabase
                    .from("user_warehouses")
                    .select('*')

                if (error) throw error;

                const mapping = {};

                data.forEach((item) => {
                    if (!mapping[item.user_id]) mapping[item.user_id] = [];

                    mapping[item.user_id].push(item.warehouse_id);
                });

                setUserWarehouses(mapping);
            } catch (error) {
                console.log(error);
            }
        };

        fetchUserWarehouses();
    }, [users]);

    useEffect(() => {
        const fetchUserRegions = async () => {
            try {
                const { data, error } = await supabase
                    .from("user_regions")
                    .select('*')

                if (error) throw error;

                const mapping = {};

                data.forEach((region) => {
                    if (!mapping[region.user_id]) mapping[region.user_id] = [];

                    mapping[region.user_id].push(region.region_id);
                });

                setUserRegions(mapping);
            } catch (error) {
                console.log(error);
            }
        };

        fetchUserRegions();
    }, [users]);

    const handleRoleChange = (id, role) => {
        setRoleChanges((prev) => ({
            ...prev,
            [id]: role
        }));
    }

    //for checkbox
    const handleWarehouseChange = (userId, warehouseId) => {
        setUserWarehouses((prev) => {
            const current = prev[userId] || [];

            if (current.includes(warehouseId)) {
                return { ...prev, [userId]: current.filter((id) => id !== warehouseId) }
            } else {
                return { ...prev, [userId]: [...current, warehouseId] }
            }
        })
    }

    //for check box
    const handleRegionChange = (userId, regionId) => {
        setUserRegions((prev) => {
            const current = prev[userId] || [];

            if (current.includes(regionId)) {
                return { ...prev, [userId]: current.filter((id) => id !== regionId) }
            } else {
                return { ...prev, [userId]: [...current, regionId] }
            }
        })
    }

    const saveUserChanges = async (userId) => {
        try {
            const newRole = roleChanges[userId];
            if (newRole) {
                const success = await updateUserRole(userId, newRole);
                if (success) {
                    setRoleChanges((prev) => {
                        const updated = { ...prev };
                        delete updated[userId];
                        return updated;
                    })
                }
            }

            // for region
            const selectedRegions = userRegions[userId] || [];

            await supabase.from("user_regions").delete().eq("user_id", userId);

            const insertRegionData = selectedRegions.map((regionId) => ({
                user_id: userId,
                region_id: regionId
            }));

            if (insertRegionData.length > 0) {
                await supabase.from("user_regions").insert(insertRegionData);
            }

            //for warehouse
            const selectedWarehouses = userWarehouses[userId] || [];

            await supabase.from("user_warehouses").delete().eq("user_id", userId);

            const insertWarehouseData = selectedWarehouses.map((warehouseId) => ({
                user_id: userId,
                warehouse_id: warehouseId
            }))

            if (insertWarehouseData.length > 0) {
                await supabase.from("user_warehouses").insert(insertWarehouseData);
            }

            alert("User Updated Successfully!");
        } catch (error) {
            console.error(error);
            alert("Error updating user.")
        }
    }

    // this is for search and filter
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchItem.toLowerCase()) &&

        (nameFilter === "" || user.name === nameFilter)
    )

    // this is for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);


    return (
        <div>
            <h1 className="font-bold mb-5 text-[24px]">User Management</h1>

            <div className="grid grid-cols-3 gap-10 mb-5">
                <CardComponent title="Total Users" count={users.length} icon={User} />
            </div>

            <div className="bg-white shadow rounded-lg border border-gray-200">
                <div className="flex items-center justify-between py-3 border-b border-[#EAECF0] px-5 space-x-4">
                    <div className="flex space-x-3">
                        <div className="flex items-center border border-gray-300 rounded-lg p-2 px-4 w-[300px] focus-within:ring-4 focus-within:ring-primary-300">
                            <Search className="w-5 h-5 text-gray-500 mr-2" />

                            <input type="text" placeholder="Search by name" value={searchItem} onChange={(e) => { setSearchItem(e.target.value); setCurrentPage(1) }} className="flex-1 outline-none border-none focus:border-none focus:ring-0" />
                        </div>

                        <div
                            className={`flex items-center border rounded-lg p-2 px-4  cursor-pointer ${showFilter ? "ring-4 ring-primary-300 outline-none border-none" : "border-gray-300"}
                         text-gray-500`}
                            onClick={() => setShowFilter(prev => !prev)}
                        >
                            <ListFilter className="w-5 h-5 mr-2" />
                            <span>Filter</span>
                        </div>
                    </div>

                    

                </div>

                {showFilter && (
                    <div className="grid grid-cols-5 gap-4 py-3 px-5 border-b border-gray-200">
                        <div className="flex flex-col space-y-2">
                            <label className="text-gray-700 font-medium">Name:</label>

                            <Dropdown label="Filter by Name" className="border border-gray-300 bg-white text-gray700 hover:bg-white" dismissOnClick={false}>
                                <DropdownItem
                                    onClick={() => {
                                        setNameFilter("");
                                        setCurrentPage(1);
                                    }}
                                >
                                    All
                                </DropdownItem>
                                {Array.from(new Set(users.map(r => r.name))).map((name, idx) => (
                                    <DropdownItem
                                        key={idx}
                                        onClick={() => {
                                            setNameFilter(name);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        {name}
                                    </DropdownItem>
                                ))}

                            </Dropdown>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto rounded-lg">
                    <Table hoverable>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell className="p-4">
                                    <Checkbox />
                                </TableHeadCell>
                                <TableHeadCell>Name</TableHeadCell>
                                <TableHeadCell>Eamil</TableHeadCell>
                                <TableHeadCell>Role</TableHeadCell>
                                <TableHeadCell>Region</TableHeadCell>
                                <TableHeadCell>Warehouse</TableHeadCell>

                                <TableHeadCell colSpan={2}>
                                    <span>Action</span>
                                </TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody className="divide-y divide-gray-200">
                            {currentUsers.map((user, index) => {
                                return (
                                    <TableRow key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                        <TableCell className="p-4">
                                            <Checkbox />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            {user.name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <select
                                                name=""
                                                id=""
                                                value={roleChanges[user.id] || user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="border rounded p-2 w-full"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="PM">PM</option>
                                                <option value="PC">PC</option>
                                                <option value="engineer">Engineer</option>
                                            </select>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                {regions.map((region) => (
                                                    <label key={region.id} className="flex items-center space-x-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={userRegions[user.id]?.includes(region.id) || false}
                                                            onChange={() => handleRegionChange(user.id, region.id)}
                                                        />
                                                        <span>{region.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                {warehouses.map((warehouse) => (
                                                    <label key={warehouse.id} className="flex items-cneter space-x-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={userWarehouses[user.id]?.includes(warehouse.id) || false}
                                                            onChange={() => handleWarehouseChange(user.id, warehouse.id)}
                                                        />
                                                        <span>{warehouse.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </TableCell>

                                        <TableCell className="flex items-center space-x-3">
                                            <button
                                                onClick={() => saveUserChanges(user.id)}
                                                className='flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 hover:border-none hover:outline-none'
                                            >
                                                <span>Save</span>
                                            </button>

                                            <Trash2 onClick={() => deleteUser(user.id)} className="text-red-500" />
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />

            </div>

        </div>
    )
}

