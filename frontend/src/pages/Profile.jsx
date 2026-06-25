

export default function Profile() {

  return (
    

      <div className="card">

        <h2>Profile</h2>

        <p>Name: {localStorage.getItem("name")}</p>
        <p>Email: {localStorage.getItem("email")}</p>
        <p>College: {localStorage.getItem("college")}</p>
        <p>Department: {localStorage.getItem("department")}</p>

      </div>

  
  );
}