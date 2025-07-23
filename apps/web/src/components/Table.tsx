interface MirrorTableProps {
  distro?: string;
}
export default function MirrorTable({ distro }: MirrorTableProps) {
  fetch(`/api/mirrorlist/${distro || ''}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // Process and display the mirror list data as needed
    })
  return (
    <div className="mirror-table">
      <h2>{distro ? `Mirror List for ${distro}` : "Mirror List"}</h2>
      {/* Placeholder content */}
      <p>List of mirrors will be displayed here.</p>
    </div>
  );
}
