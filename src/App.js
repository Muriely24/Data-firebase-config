import { useState, useEffect } from "react";
import { db } from './firebase-config';
import { collection, getDocs, addDoc, deleteDoc,doc } from 'firebase/firestore';
import DataDisplay from './DataDisplay';

function App() {
  // Define state variables using useState hooks
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newCustomerLevel, setNewCustomerLevel] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  const [customers, setCustomers] = useState([]);
  const customersCollectionRef = collection(db, "customers");

  useEffect(() => {
    const getCustomers = async () => {
      const data = await getDocs(customersCollectionRef);
      setCustomers(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };

    getCustomers();
  }, []);

  const createCustomer = async () => {
    await addDoc(customersCollectionRef, {
      Name: newName,
      Address: newAddress,
      Notes: newNotes,
      CustomerLevel: newCustomerLevel,
      ContactName: newContactName,
      ContactEmail: newContactEmail,
      ContactPhone: newContactPhone
    });
  };

  const deleteCustomer = async (customerId) => {
    await deleteDoc(doc(db, "customers", customerId));
    setCustomers(customers.filter(customer => customer.id !== customerId));
  };

  return (
    <div className="App">
       <DataDisplay data={customers} setData={setCustomers} />

      <input
        placeholder="Name..."
        onChange={(event) => {
          setNewName(event.target.value);
        }}
      />
      <input
        placeholder="Address..."
        onChange={(event) => {
          setNewAddress(event.target.value);
        }}
      />
      <input
        placeholder="Notes..."
        onChange={(event) => {
          setNewNotes(event.target.value);
        }}
      />
      <input
        placeholder="CustomerLevel..."
        onChange={(event) => {
          setNewCustomerLevel(event.target.value);
        }}
      />
      <input
        placeholder="ContactName..."
        onChange={(event) => {
          setNewContactName(event.target.value);
        }}
      />
      <input
        placeholder="ContactEmail..."
        onChange={(event) => {
          setNewContactEmail(event.target.value);
        }}
      />
      <input
        placeholder="ContactPhone..."
        onChange={(event) => {
          setNewContactPhone(event.target.value);
        }}
      />
      <button onClick={createCustomer}> Create customer</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Notes</th>
            <th>Customer Level</th>
            <th>Contact Name</th>
            <th>Contact Email</th>
            <th>Contact Phone</th>
            <th>Action</th> {/* Add this header for the delete button */}
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.Name}</td>
              <td>{customer.Address}</td>
              <td>{customer.Notes}</td>
              <td>{customer.CustomerLevel}</td>
              <td>{customer.ContactName}</td>
              <td>{customer.ContactEmail}</td>
              <td>{customer.ContactPhone}</td>
              <td>
                <button onClick={() => deleteCustomer(customer.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
