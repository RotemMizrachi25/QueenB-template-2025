import React, { useState } from "react";
import "./Form.css";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";

function MentorSignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [description, setDescription] = useState("");
  const [image,     setImage]     = useState(null);
  const [linkedin,  setLinkedin]  = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");

  // Chip/tag arrays (multiple selections)
  const [programmingLanguages, setProgrammingLanguages] = useState([]);
  const [technologies,         setTechnologies]         = useState([]);
  const [domains,              setDomains]              = useState([]);

  const [phoneError, setPhoneError] = useState("");

  // Suggestions (customize or fetch later)
  const programmingLanguageSuggestions = [
    "JavaScript","Python","Java","C++","C#","TypeScript","Go","Rust","SQL","Swift","Kotlin","Scala","Ruby"
  ];
  const technologySuggestions = [
    "React","Node.js","Express","MongoDB","PostgreSQL","MySQL","Docker","Kubernetes","AWS","Azure","GCP","Redux","Next.js"
  ];
  const domainSuggestions = [
    "Web","Mobile","Data Science","Machine Learning","DevOps","Cloud","Cybersecurity","Backend","Frontend","Full Stack","E-commerce","EdTech"
  ];

  function validatePhone(value) {
    const ok = /^\d{10}$/.test(value);
    setPhoneError(ok ? "" : "Invalid phone number, use 10 digits.");
    return ok;
  }

  function handleImage(e) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return setImage(null);
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    setImage(file);
  }

  function handleForm() {
    if (!firstName || !lastName || !email || !password || !phone) {
      alert("Please fill first name, last name, email, password, and phone.");
      return;
    }
    if (!validatePhone(phone)) return;
    if (!image) {
      alert("Please upload a profile photo.");
      return;
    }

    const fd = new FormData();
    fd.append("email", email);
    fd.append("password", password);
    fd.append("firstName", firstName);
    fd.append("lastName", lastName);
    fd.append("phoneNumber", phone);
    fd.append("yearsOfExperience", String(yearsOfExperience || 0));
    fd.append("generalDescription", description || "");
    fd.append("linkedinUrl", linkedin || "");

    // Join arrays as CSV strings (backend will split)
    fd.append("programmingLanguages", programmingLanguages.join(","));
    fd.append("technologies", technologies.join(","));
    fd.append("domains", domains.join(","));

    // File field name must match multer single('photo') on server
    fd.append("profilePhoto", image);

    fetch("http://localhost:5000/api/auth/register-mentor", {
      method: "POST",
      body: fd,
      credentials: "include",
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          const msg = data?.error || data?.message || data?.errors?.[0]?.msg || "Registration failed";
          throw new Error(msg);
        }
        return data;
      })
      .then((data) => {
        console.log("Mentor registered:", data);
        alert("Mentor registered!");
      })
      .catch((err) => alert(err.message));
  }

  return (
    <div className="container">
      <div className="form-card">
        <form>
          <h2 className="title">Registration</h2>

          <label htmlFor="firstName" className="label">First Name</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="input"
          />

          <label htmlFor="lastName" className="label">Last Name</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="input"
          />

          <label htmlFor="phone" className="label">Phone</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); validatePhone(e.target.value); }}
            className="input"
          />
          {phoneError && <p className="error">{phoneError}</p>}

          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />

          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="Choose password"
          />

          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="textarea"
          />

          <label htmlFor="yearsOfExperience" className="label">Years of Experience</label>
          <input
            id="yearsOfExperience"
            type="number"
            min="0"
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(e.target.value)}
            className="input"
            placeholder="Enter years of experience"
          />

          {/* ---- Tags (chips) with MUI Autocomplete; keep your labels ---- */}

          <label id="progLangs-label" className="label">Programming Languages</label>
          <Autocomplete
            multiple
            freeSolo
            options={programmingLanguageSuggestions}
            value={programmingLanguages}
            onChange={(e, newValue) => setProgrammingLanguages(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} key={option + index} />
              ))
            }
            renderInput={(params) => (
              // Keep your styling: plain input wrapped with the provided ref
              <div ref={params.InputProps.ref}>
                <input
                  type="text"
                  className="input"
                  placeholder="Type and press Enter"
                  aria-labelledby="progLangs-label"
                  {...params.inputProps}
                />
              </div>
            )}
          />

          <label id="technologies-label" className="label">Technologies</label>
          <Autocomplete
            multiple
            freeSolo
            options={technologySuggestions}
            value={technologies}
            onChange={(e, newValue) => setTechnologies(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} key={option + index} />
              ))
            }
            renderInput={(params) => (
              <div ref={params.InputProps.ref}>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. React, Node.js, Docker"
                  aria-labelledby="technologies-label"
                  {...params.inputProps}
                />
              </div>
            )}
          />

          <label id="domains-label" className="label">Domains</label>
          <Autocomplete
            multiple
            freeSolo
            options={domainSuggestions}
            value={domains}
            onChange={(e, newValue) => setDomains(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} key={option + index} />
              ))
            }
            renderInput={(params) => (
              <div ref={params.InputProps.ref}>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Web, ML, DevOps"
                  aria-labelledby="domains-label"
                  {...params.inputProps}
                />
              </div>
            )}
          />

          <label htmlFor="linkedin" className="label">LinkedIn</label>
          <input
            id="linkedin"
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className="input"
            placeholder="https://www.linkedin.com/in/username"
          />

          <label htmlFor="image" className="label">Image</label>
          <input id="image" type="file" onChange={handleImage} />

          <button type="button" className="button" onClick={handleForm}>
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
}

export default MentorSignUp;
