import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoImg from './assets/SLON.png';
import { db } from './firebase-config';
import { collection, getDocs, addDoc } from 'firebase/firestore';

// Define the Customers class with fixed structure
class Customers {
  constructor(name, address, notes, customerLevel, contactName, contactEmail, contactPhone) {
    this.name = name;
    this.address = address;
    this.notes = notes;
    this.customerLevel = customerLevel;
    this.contactName = contactName;
    this.contactEmail = contactEmail;
    this.contactPhone = contactPhone;
  }
}

const DataDisplay = () => {
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);
  
  const fetchCustomers = async () => {
    try {
      const customersCollectionRef = collection(db, "customers");
      const querySnapshot = await getDocs(customersCollectionRef);
      const customers = querySnapshot.docs.map(doc => doc.data());
      setData(customers);
    } catch (error) {
      console.error("Error fetching customers: ", error);
      setErrorMessage('Error fetching customers from Firebase.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const fileType = file.name.split('.').pop();

    if (fileType === 'xlsx') {
      readXLSXFile(file);
      setErrorMessage('');
    } else if (fileType === 'csv') {
      readCSVFile(file);
      setErrorMessage('');
    } else {
      setErrorMessage('Only .xlsx and .csv files are supported.');
    }
  };

  const readCSVFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target.result;
      const lines = csvData.split('\n').map(line => line.trim());
      lines.shift(); // Remove the first row (headers)
      const customers = lines.map(line => {
        const values = line.split(',');
        return new Customers(...values);
      });
      uploadDataToFirestore(customers);
      setData(prevData => [...prevData, ...customers]); // Append new data to existing data
    };
    reader.readAsText(file);
  };

  const readXLSXFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
      excelData.shift(); // Remove the first row (headers)
      const customers = excelData.map(row => new Customers(...row));
      setData(prevData => [...prevData, ...customers]); // Append new data to existing data
      uploadDataToFirestore(customers);  
    };
    reader.readAsArrayBuffer(file);
  };
  const uploadDataToFirestore = async (customers) => {
    const customersCollectionRef = collection(db, "customers");
    customers.forEach(async (customer) => {
      try {
        await addDoc(customersCollectionRef, {
          Name: customer.name,
          Address: customer.address,
          Notes: customer.notes,
          CustomerLevel: customer.customerLevel,
          ContactName: customer.contactName,
          ContactEmail: customer.contactEmail,
          ContactPhone: customer.contactPhone
        });
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    });
  };




  // Function to handle field update
  const handleFieldChange = (index, field, value) => {
    const updatedData = [...data];
    updatedData[index][field] = value;
    setData(updatedData);
  };

  // Function to generate PDF
const generatePDF = () => {
  const customersCollectionRef = collection(db, "customers");
  getDocs(customersCollectionRef)
    .then((querySnapshot) => {
      const customers = querySnapshot.docs.map(doc => doc.data());

      const doc = new jsPDF();

      // Add logo image
      const logoDataUrl = logoImg; // Use the imported logo image directly
      const logoWidth = 100; // Adjust the width of the logo
      const logoHeight = 25; // Adjust the height of the logo
      const logoX = 10; // Adjust the X coordinate of the logo
      const logoY = 10; // Adjust the Y coordinate of the logo
      doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight); // Adjust the position and dimensions as needed

      doc.text(90, 10, 'Customer Data');
      
      const columns = ['Name', 'Address', 'Notes', 'Customer Level', 'Contact Name', 'Contact Email', 'Contact Phone'];
      const rows = customers.map(customer => [customer.Name, customer.Address, customer.Notes, customer.CustomerLevel, customer.ContactName, customer.ContactEmail, customer.ContactPhone]);

      // Adjust the startY parameter to change the position of the table
      doc.autoTable({
        head: [columns],
        body: rows,
        startY: 50, // Adjust the startY position of the table
      });

      doc.save('customer_data.pdf');
    })
    .catch((error) => {
      console.error("Error generating PDF: ", error);
      setErrorMessage('Error generating PDF.');
    });
};


  // Function to download data as XLSX file
  const downloadXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    XLSX.writeFile(workbook, 'customer_data.xlsx');
  };

  // Function to download data as CSV file
  const downloadCSV = () => {
    // Define CSV header with class properties
    const csvHeader = ['Name', 'Address', 'Notes', 'Customer Level', 'Contact Name', 'Contact Email', 'Contact Phone'];
  
    // Combine header with customer data
    const csvContent = `${csvHeader.join(',')}\n${data.map(e => Object.values(e).join(",")).join("\n")}`;
  
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'customer_data.csv');
    document.body.appendChild(link);
  
    link.click();
  
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  return (
    <div>
      <img src={logoImg} alt="Logo" />   
      <p style={{ color: 'red' }}>{errorMessage}</p>

      <label htmlFor="fileInput">Upload .xlsx or .csv file:</label>
      <input id="fileInput" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />

      <button onClick={generatePDF}>Generate PDF</button>
      <button onClick={downloadXLSX}>Download XLSX</button>
      <button onClick={downloadCSV}>Download CSV</button>

     
    </div>
  );
};

export default DataDisplay;
