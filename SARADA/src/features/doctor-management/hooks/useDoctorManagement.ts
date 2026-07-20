import { useState, useMemo } from "react";
import { Doctor } from "../../../shared/types";

const MOCK_DATA = {
  "doctors": [],
  "statusOptions": [
    "Available",
    "On Rounds",
    "In Surgery",
    "On Leave",
    "Emergency Only"
  ]
};

export const useDoctorManagement = (initialDoctors: Doctor[] = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const doctorsList = useMemo(() => {
    return initialDoctors.length > 0 ? initialDoctors : (MOCK_DATA.doctors as Doctor[]);
  }, [initialDoctors]);

  const filteredDoctors = useMemo(() => {
    return doctorsList.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || doc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [doctorsList, searchTerm, statusFilter]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  return {
    filteredDoctors,
    searchTerm,
    handleSearch,
    statusFilter,
    handleStatusFilterChange,
    statusOptions: MOCK_DATA.statusOptions,
  };
};

