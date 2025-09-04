import { useState, useEffect, useMemo } from 'react';
import axios from '../axios';
import { useToast } from '@chakra-ui/react';

export const useLoanAccount = () => {
  const [data, setData] = useState([]);
  const [newID, setNewID] = useState(null);
  const [totalLoanAmt, setTotalLoanAmt] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [officers, setOfficers] = useState([]);
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(false);
  const [isOfficerChangeModalOpen, setIsOfficerChangeModalOpen] = useState(false);
  const [selectedUserForOfficerChange, setSelectedUserForOfficerChange] = useState(null);
  const [newOfficerId, setNewOfficerId] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  
  const usersPerPage = 10;
  const toast = useToast();

  // Fetch officers data
  const fetchOfficers = async () => {
    try {
      setIsLoadingOfficers(true);
      const response = await axios.get("officers");
      console.log('🔍 Raw officers response:', response?.data);
      
      if (response?.data?.result) {
        // Filter to show only collection officers
        const collectionOfficers = response.data.result.filter(officer => {
          // Check multiple possible role fields and values
          const role = officer.role || officer.role_type || officer.user_role || officer.type;
          const isCollectionOfficer = role && (
            role.toLowerCase().includes("collection") ||
            role.toLowerCase().includes("officer") ||
            role.toLowerCase().includes("field") ||
            role.toLowerCase().includes("agent")
          );
          
          // Also check if officer has collection-related permissions
          const hasCollectionPermission = officer.permissions && 
            (officer.permissions.includes("collection") || 
             officer.permissions.includes("loan") ||
             officer.permissions.includes("user_management"));
          
          return isCollectionOfficer || hasCollectionPermission;
        });
        
        console.log('👥 All officers:', response.data.result.length);
        console.log('👥 Collection officers found:', collectionOfficers.length);
        
        setOfficers(collectionOfficers);
        
        if (collectionOfficers.length === 0) {
          // If no collection officers found, show all officers for debugging
          console.log('⚠️ No collection officers found, showing all officers');
          setOfficers(response.data.result);
          
          // Show a toast to inform the user
          toast({
            title: "No collection officers found",
            description: "Showing all available officers. Please check officer roles.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      } else if (response?.data?.officers) {
        // Alternative data structure
        const collectionOfficers = response.data.officers.filter(officer => {
          const role = officer.role || officer.role_type || officer.user_role || officer.type;
          return role && role.toLowerCase().includes("collection");
        });
        setOfficers(collectionOfficers);
        console.log('👥 Officers from alternative structure:', collectionOfficers.length);
      } else {
        console.log('⚠️ No officers data found in response');
        setOfficers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching officers:', error);
      toast({
        title: "Error fetching officers",
        description: "Failed to load officer data",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      setOfficers([]);
    } finally {
      setIsLoadingOfficers(false);
    }
  };

  // Fetch loan account data
  const fetchData = async () => {
    try {
      const response = await axios.get("users/");
      if (response?.data) {
        setData(response?.data?.result);
        console.log(response?.data?.result);
        setFilteredData(response?.data?.result);
        
        const sum = response.data.result.reduce((acc, item) => {
          return acc + (item.active_loan_id?.total_amount || 0);
        }, 0);
        setTotalLoanAmt(sum);
      }
    } catch (error) {
      console.error('❌ Error fetching loan account data:', error);
      toast({
        title: "Error fetching data",
        description: "Failed to load loan account data",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchData();
    fetchOfficers();
  }, []);

  // Filter and sort data
  useEffect(() => {
    let result = data;
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      result = data.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone_number?.toString().includes(searchTerm)
      );
    }
    
    // Apply sorting
    if (sortBy) {
      result = [...result].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case "amount_high_to_low":
            aValue = a.active_loan_id?.loan_amount || 0;
            bValue = b.active_loan_id?.loan_amount || 0;
            return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            
          case "amount_low_to_high":
            aValue = a.active_loan_id?.loan_amount || 0;
            bValue = b.active_loan_id?.loan_amount || 0;
            return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            
          case "name_a_z":
            aValue = a.full_name?.toLowerCase() || "";
            bValue = b.full_name?.toLowerCase() || "";
            return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            
          case "date_created":
            aValue = new Date(a.createdAt || a.active_loan_id?.created_on || 0);
            bValue = new Date(b.createdAt || b.active_loan_id?.created_on || 0);
            return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            
          default:
            return 0;
        }
      });
    }
    
    setFilteredData(result);
    setCurrentPage(1);
  }, [searchTerm, data, sortBy, sortOrder]);

  // Handle delete
  const handleDelete = () => {
    axios
      .delete(`users/${newID}`)
      .then((res) => {
        if (res.data) {
          toast({
            title: `Success! User has been deleted successfully`,
            status: "success",
            duration: 4000,
            isClosable: true,
            position:"top"
          });
          // Update state without reload
          setData((prev) => prev.filter((item) => item._id !== newID));
          setFilteredData((prev) => prev.filter((item) => item._id !== newID));
        }
      })
      .catch((err) => {
        toast({
          title: `Something Went Wrong!`,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      });
  };

  // Handle edit save
  const handleEditSave = async () => {
    try {
      // Validate required fields
      if (!editData?.full_name || !editData?.phone_number) {
        toast({
          title: "Validation Error",
          description: "Full name and phone number are required",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      // Update user details
      const userUpdateData = {
        full_name: editData.full_name,
        phone_number: editData.phone_number,
        email: editData.email || "",
        address: editData.address || "",
        officer_id: editData.officer_id?._id || editData.officer_id || null
      };

      // Update loan details
      const loanUpdateData = {
        loan_amount: editData.active_loan_id?.loan_amount || 0,
        total_amount: editData.active_loan_id?.total_amount || 0,
        emi_day: editData.active_loan_id?.emi_day || 0,
        total_due_amount: editData.active_loan_id?.total_due_amount || 0,
        interest_rate: editData.active_loan_id?.interest_rate || 0,
        principle_amount: editData.active_loan_id?.principle_amount || 0,
        total_penalty_amount: editData.active_loan_id?.total_penalty_amount || 0,
        created_on: editData.active_loan_id?.created_on || new Date(),
        end_date: editData.active_loan_id?.end_date || new Date()
      };

      // Update user details
      const userResponse = await axios.put(`users/${editData._id}`, userUpdateData);
      
      // Update loan details using admin route
      const loanResponse = await axios.put(`admins/edit-loan-user/${editData._id}`, {
        ...userUpdateData,
        ...loanUpdateData
      });

      if (userResponse.data && loanResponse.data) {
        toast({
          title: `User and Loan details updated successfully`,
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top"
        });

        // Update local state with new data
        const updatedData = data.map((item) =>
          item._id === editData._id ? { ...item, ...editData } : item
        );
        
        setData(updatedData);
        setFilteredData(updatedData);
        setIsEditing(false);
        setEditData(null);
      }
    } catch (err) {
      console.error("Update error:", err);
      toast({
        title: `Update Failed`,
        description: err.response?.data?.message || "Failed to update user and loan details",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // Handle edit close
  const handleEditClose = () => {
    setIsEditing(false);
    setEditData(null);
  };

  // Handle sorting
  const handleSort = (sortType) => {
    if (sortBy === sortType) {
      // Toggle sort order if same sort type is clicked
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort type and default to ascending
      setSortBy(sortType);
      setSortOrder("asc");
    }
  };

  // Get display name for sort type
  const getSortDisplayName = (sortType) => {
    switch (sortType) {
      case "amount_high_to_low":
        return 'Amount High to Low';
      case "amount_low_to_high":
        return 'Amount Low to High';
      case "name_a_z":
        return 'Name A-Z';
      case "date_created":
        return 'Date Created';
      default:
        return '';
    }
  };

  // Function to quickly change officer
  const handleQuickOfficerChange = async (userId, newOfficerId) => {
    try {
      const response = await axios.put(`users/${userId}`, {
        officer_id: newOfficerId
      });

      if (response.data) {
        toast({
          title: "Officer changed successfully",
          description: "The loan account has been reassigned to a new officer",
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top"
        });

        // Update local state
        const updatedData = data.map((item) =>
          item._id === userId 
            ? { 
                ...item, 
                officer_id: officers.find(officer => officer._id === newOfficerId) 
              } 
            : item
        );
        
        setData(updatedData);
        setFilteredData(updatedData);
      }
    } catch (error) {
      console.error("Officer change error:", error);
      toast({
        title: "Failed to change officer",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredData.slice(startIndex, startIndex + usersPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / usersPerPage);

  return {
    // State
    data,
    newID,
    totalLoanAmt,
    currentPage,
    filteredData,
    searchTerm,
    editData,
    isEditing,
    officers,
    isLoadingOfficers,
    isOfficerChangeModalOpen,
    selectedUserForOfficerChange,
    newOfficerId,
    sortBy,
    sortOrder,
    paginatedData,
    totalPages,
    
    // Setters
    setNewID,
    setSearchTerm,
    setEditData,
    setIsEditing,
    setIsOfficerChangeModalOpen,
    setSelectedUserForOfficerChange,
    setNewOfficerId,
    setCurrentPage,
    
    // Functions
    fetchOfficers,
    handleDelete,
    handleEditSave,
    handleEditClose,
    handleSort,
    getSortDisplayName,
    handleQuickOfficerChange
  };
};
