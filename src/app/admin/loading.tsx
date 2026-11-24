export default function AdminLoading() {
  return (
    <main className="admin-page admin-loading" aria-label="Loading admin page" aria-busy="true">
      <div className="admin-loading-heading"><span/><i/><i/></div>
      <div className="admin-loading-stats">{[1,2,3,4].map(item => <div key={item}/>)}</div>
      <div className="admin-loading-panel"><div/><div/><div/><div/><div/></div>
    </main>
  );
}
