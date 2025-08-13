import React, { useState } from "react";
import "./Form.css";

export default function Form() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [phoneError, setPhoneError] = useState(" ");
  const [emailError, setEmailError] = useState(" ");
  const [submitted, setSubmitted] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");

  function handleImage(image) {
    setImage(image.target.files[0]);
  }

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setDescription("");
    setFirstNameError("");
    setEmailError("");
    setLastNameError("");
    setPhoneError("");
    setSubmitted(false);
  };

  function handleForm(e) {
    e.preventDefault();
    setSubmitted(true);

    if (phone.length < 10 || phone.length > 10) {
      setPhoneError("Invalid phone number, try again...");
    } else {
      setPhoneError("");
    }

    if (!email.includes("@")) {
      setEmailError("Invalid email address, try again...");
    } else {
      setEmailError("");
    }

    if (firstName.trim() === "") {
      setFirstNameError("First name is required");
    } else {
      setFirstNameError("");
    }

    if (lastName.trim() === "") {
      setLastNameError("Last name is required");
    } else {
      setLastNameError("");
    }
    resetForm();
  }

  return (
    <div className="container">
      <div className="form-card">
        <form>
          <h2 className="title">Registration</h2>

          <label htmlFor="firstName" className="label">
            First Name
          </label>
          {firstNameError && <span className="error">{firstNameError}</span>}
          <input
            id="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            className="input"
          />

          <label htmlFor="lastName" className="label">
            Last Name
          </label>
          {lastNameError && <span className="error">{lastNameError}</span>}
          <input
            id="lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            className="input"
          />

          <label htmlFor="phone" className="label">
            Phone
          </label>
          {phoneError && <span className="error">{phoneError}</span>}
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
            }}
            placeholder="Enter your phone number"
            className="input"
          />

          <label htmlFor="email" className="label">
            Email
          </label>
          {emailError && <span className="error">{emailError}</span>}
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="Enter your email"
            className="input"
          />
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            placeholder="Tell us something about yourself"
            rows={5}
            className="textarea"
          />

          <label htmlFor="image" className="label">
            Image
          </label>
          <input type="file" onChange={handleImage} />

          <button type="submit" className="submit-btn" onClick={handleForm}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
