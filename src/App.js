import React, { useState, useMemo, useEffect } from 'react';
import { students } from './studentsData';
import './App.css';


function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(24);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // SAFE DATA CHECK: Ensure students is an array
  const safeStudents = useMemo(() => Array.isArray(students) ? students : [], []);

  // SAFE DEPARTMENTS: Handle potential nulls in data
  const departments = useMemo(() => {
    const depts = safeStudents.map(s => s?.Department).filter(Boolean);
    return ["All", ...new Set(depts)].sort();
  }, [safeStudents]);

  // SAFE FILTERING: Added extra checks for undefined names/rolls
  const filteredStudents = useMemo(() => {
    return safeStudents.filter((s) => {
      if (!s) return false;
      const name = (s.Name || "").toLowerCase();
      const roll = (s["Roll No"] || "").toString();
      const dept = s.Department || "";
      const gender = s.Gender || "";

      const matchesSearch = name.includes(searchTerm.toLowerCase()) || roll.includes(searchTerm);
      const matchesDept = deptFilter === "All" || dept === deptFilter;
      const matchesGender = genderFilter === "All" || gender === genderFilter;

      return matchesSearch && matchesDept && matchesGender;
    });
  }, [safeStudents, searchTerm, deptFilter, genderFilter]);

  // SCROLL LOGIC
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop + 200 >= document.documentElement.offsetHeight) {
        setVisibleCount(prev => prev + 24);
      }
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // If the data file is completely broken
  if (safeStudents.length === 0) {
    return <div className="error-screen"><h1>Data missing! Check studentsData.js</h1></div>;
  }

  return (
    <div className={`App ${selectedStudent ? 'modal-open' : ''}`}>
      <div className="background-glow"></div>
      
      <header className="App-header">
        <div className="brand">
          <h1 className="title">STUDENT SEARCH <span className="highlight">Y25</span></h1>
        </div>
        
        <div className="filter-panel">
          <input
            type="text"
            placeholder="Search name or roll number..."
            className="modern-input"
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setVisibleCount(24);}}
          />
          <div className="select-group">
            <select className="modern-select" value={deptFilter} onChange={(e) => {setDeptFilter(e.target.value); setVisibleCount(24);}}>
              <option value="All">All Departments</option>
              {departments.filter(d => d !== "All").map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="modern-select" value={genderFilter} onChange={(e) => {setGenderFilter(e.target.value); setVisibleCount(24);}}>
              <option value="All">All Genders</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
        </div>
        <p className="stats">Displaying {filteredStudents.length} Students</p>
      </header>

      <div className="student-grid">
        {filteredStudents.slice(0, visibleCount).map((student, index) => (
          <div 
            key={student["Roll No"] || index} 
            className="glass-card" 
            onClick={() => setSelectedStudent(student)}
          >
            <div className="card-image">
              <img 
                src={`https://oa.iitk.ac.in/Oa/Jsp/Photo/${student["Roll No"]}_0.jpg`} 
                alt="" 
                loading="lazy"
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.Name || "User")}&background=random`; 
                }}
              />
              <div className="card-overlay">View Details</div>
            </div>
            <div className="card-info">
              <h3>{student.Name || "Unknown"}</h3>
              <span className="dept-badge">{student.Department || "N/A"}</span>
              <p className="roll-text">#{student["Roll No"] || "000000"}</p>
            </div>
          </div>
        ))}
      </div>

      {showScrollTop && <button className="scroll-btn" onClick={scrollToTop}>↑</button>}

      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content glass-morphism" onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={() => setSelectedStudent(null)}>&times;</button>
            <div className="modal-layout">
              <img 
                className="modal-img" 
                src={`https://oa.iitk.ac.in/Oa/Jsp/Photo/${selectedStudent["Roll No"]}_0.jpg`} 
                alt="" 
                onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=No+Photo" }}
              />
              <div className="modal-text">
                <h2>{selectedStudent.Name}</h2>
                <div className="info-row"><strong><span>Roll No</span> </strong>{selectedStudent["Roll No"]}</div>
                <div className="info-row"><strong><span>Name</span> </strong>{selectedStudent["Name"]}</div>
                <div className="info-row"><strong><span>Gender</span> </strong>{selectedStudent["Gender"]}</div>
                <div className="info-row"><strong><span>Dept</span> </strong>{selectedStudent.Department}</div>
                <div className="info-row"><strong><span>Program</span> </strong>{selectedStudent.Program}</div>
                <div className="info-row"><strong><span>Hostel</span> </strong>{selectedStudent["Hostel Info"]}</div>
                <div className="info-row"><strong><span>Email</span> </strong><a href={`mailto:${selectedStudent["E-Mail"]}`}>{selectedStudent["E-Mail"]}</a></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;