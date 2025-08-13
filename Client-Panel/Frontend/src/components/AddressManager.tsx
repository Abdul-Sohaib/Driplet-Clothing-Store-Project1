/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

type Address = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

type User = {
  name: string;
  email: string;
  _id: string;
};

interface AddressManagerProps {
  user: User | null;
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
}

const AddressManager = ({
  user,
  selectedAddress,
  setSelectedAddress,
}: AddressManagerProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Address>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setAddresses([]);
      setSelectedAddress(null);
      return;
    }
    const fetchAddresses = async () => {
      try {
        const response = await axios.get(`${API_BASE}/auth/addresses`, { withCredentials: true });
        console.log("Addresses fetch response:", response.data);
        const fetchedAddresses = response.data.addresses || [];
        setAddresses(fetchedAddresses);
        if (fetchedAddresses.length > 0 && !selectedAddress) {
          setSelectedAddress(fetchedAddresses[fetchedAddresses.length - 1]);
        }
      } catch (err: any) {
        console.error("Fetch addresses error:", err.response?.data?.message || err.message);
        setAddresses([]);
        toast.error("Failed to fetch addresses.");
      }
    };
    fetchAddresses();
  }, [user, setSelectedAddress]);

  const handleAddAddress = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      console.log("Add address attempt:", newAddress);
      const response = await axios.post(`${API_BASE}/auth/address`, newAddress, { withCredentials: true });
      const updatedAddresses = response.data.addresses || [];
      console.log("Add address response:", updatedAddresses);
      setAddresses(updatedAddresses);
      setNewAddress({
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
      });
      setSelectedAddress(updatedAddresses[updatedAddresses.length - 1]);
      toast.success("Address added successfully!");
    } catch (err: any) {
      console.error("Add address error:", err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || "Failed to add address. Please try again.");
    }
  };

  const handleEditAddress = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (editIndex === null || !editingAddress) return;
    try {
      console.log("Edit address attempt:", { index: editIndex, address: editingAddress });
      const response = await axios.put(`${API_BASE}/auth/address/${editIndex}`, editingAddress, { withCredentials: true });
      const updatedAddresses = response.data.addresses || [];
      console.log("Edit address response:", updatedAddresses);
      setAddresses(updatedAddresses);
      setEditingAddress(null);
      setEditIndex(null);
      setSelectedAddress(updatedAddresses[editIndex] || null);
      toast.success("Address updated successfully!");
    } catch (err: any) {
      console.error("Edit address error:", err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || "Failed to update address. Please try again.");
    }
  };

  const handleDeleteAddress = async (index: number) => {
    try {
      console.log("Delete address attempt:", { index });
      const response = await axios.delete(`${API_BASE}/auth/address/${index}`, { withCredentials: true });
      const updatedAddresses = response.data.addresses || [];
      console.log("Delete address response:", updatedAddresses);
      setAddresses(updatedAddresses);
      if (selectedAddress && selectedAddress === addresses[index]) {
        setSelectedAddress(updatedAddresses.length > 0 ? updatedAddresses[updatedAddresses.length - 1] : null);
      }
      toast.success("Address deleted successfully!");
    } catch (err: any) {
      console.error("Delete address error:", err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || "Failed to delete address. Please try again.");
    }
  };

  const startEditing = (address: Address, index: number) => {
    setEditingAddress({ ...address });
    setEditIndex(index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 sm:gap-4">
  <div className="flex flex-col gap-2">
    <strong className="text-base sm:text-lg mb-2 navheading tracking-wider">Your Addresses:</strong>
    {(!addresses || addresses.length === 0) && (
      <div className="text-black mb-2 tracking-wide text-sm sm:text-base">No saved addresses. Please add one.</div>
    )}
    {addresses.map((a, idx) => (
      <div
        key={idx}
        className={`p-2 sm:p-3 rounded-md cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center font-semibold gap-2 sm:gap-4 ${
          selectedAddress === a ? "border-2 border-black" : "border-2 border-black"
        }`}
      >
        <div onClick={() => setSelectedAddress(a)} className="text-xs sm:text-sm flex-1">
          <div>{a.fullName}, {a.phone}</div>
          <div>{a.addressLine1}, {a.addressLine2}</div>
          <div>{a.city}, {a.state} - {a.pincode}, {a.country}</div>
        </div>
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <button
            onClick={() => setSelectedAddress(a)}
            className="button-add font-semibold text-xs rounded-md navheading tracking-wider px-2 sm:px-3 py-1 sm:py-2"
          >
            Select
          </button>
          <button
            onClick={() => startEditing(a, idx)}
            className="button-add font-semibold text-xs rounded-md navheading tracking-wider px-2 sm:px-3 py-1 sm:py-2"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteAddress(idx)}
            className="button-add font-semibold rounded-md text-xs navheading tracking-wider px-2 sm:px-3 py-1 sm:py-2"
          >
            Delete
          </button>
        </div>
      </div>
    ))}
  </div>

  <form className="space-y-2 sm:space-y-3 justify-center grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 items-center" onSubmit={editingAddress ? handleEditAddress : handleAddAddress}>
    <input
      type="text"
      placeholder="Full Name"
      required
      value={editingAddress ? editingAddress.fullName : newAddress.fullName}
      onChange={e => {
        if (editingAddress) {
          setEditingAddress({ ...editingAddress, fullName: e.target.value });
        } else {
          setNewAddress({ ...newAddress, fullName: e.target.value });
        }
      }}
      className="w-full border border-black rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
    />
    <input
      type="text"
      placeholder="Phone"
      required
      value={editingAddress ? editingAddress.phone : newAddress.phone}
      onChange={e => {
        if (editingAddress) {
          setEditingAddress({ ...editingAddress, phone: e.target.value });
        } else {
          setNewAddress({ ...newAddress, phone: e.target.value });
        }
      }}
      className="w-full border border-black rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
    />
    <input
      type="text"
      placeholder="Address Line 1"
      required
      value={editingAddress ? editingAddress.addressLine1 : newAddress.addressLine1}
      onChange={e => {
        if (editingAddress) {
          setEditingAddress({ ...editingAddress, addressLine1: e.target.value });
        } else {
          setNewAddress({ ...newAddress, addressLine1: e.target.value });
        }
      }}
      className="w-full border border-black rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
    />
    <input
      type="text"
      placeholder="Address Line 2"
      value={editingAddress ? editingAddress.addressLine2 : newAddress.addressLine2}
      onChange={e => {
        if (editingAddress) {
          setEditingAddress({ ...editingAddress, addressLine2: e.target.value });
        } else {
          setNewAddress({ ...newAddress, addressLine2: e.target.value });
        }
      }}
      className="w-full border border-black rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
    />
    <input
      type="text"
      placeholder="City"
      required
      value={editingAddress ? editingAddress.city : newAddress.city}
      onChange={e => {
        if (editingAddress) {
          setEditingAddress({ ...editingAddress, city: e.target.value });
        } else {
          setNewAddress({ ...newAddress, city: e.target.value });
        }
      }}
      className="w-full border border-black rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
    />
    <input
      type="text"
      placeholder="State"
      required
      value={editingAddress ? editingAddress.state : newAddress.state}
      onChange={e => {
        if (editingAddress) {
          setEditingAddress({ ...editingAddress, state: e.target.value });
        } else {
          setNewAddress({ ...newAddress, state: e.target.value });
        }
      }}
      className="w-full border border-black rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
    />
    <input
      type="text"
      placeholder="Pincode"
      required
      value={editingAddress ? editingAddress.pincode : newAddress.pincode}
      onChange={e => {
        if (editingAddress) {
          setEditingAddress({ ...editingAddress, pincode: e.target.value });
        } else {
          setNewAddress({ ...newAddress, pincode: e.target.value });
        }
      }}
      className="w-full border border-black rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
    />

    {/* Submit and Cancel Buttons */}
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-5 w-full col-span-1 sm:col-span-2 lg:col-span-3">
      <button
        type="submit"
        className="button-add font-bold rounded-md text-xs navheading tracking-wider px-3 sm:px-4 py-2 w-full sm:w-auto"
      >
        {editingAddress ? "Update Address" : "Add Address"}
      </button>
      {editingAddress && (
        <button
          type="button"
          onClick={() => {
            setEditingAddress(null);
            setEditIndex(null);
          }}
          className="button-add font-bold rounded-md text-xs navheading tracking-wider px-3 sm:px-4 py-2 w-full sm:w-auto"
        >
          Cancel
        </button>
      )}
    </div>
  </form>
</div>

  );
};

export default AddressManager;