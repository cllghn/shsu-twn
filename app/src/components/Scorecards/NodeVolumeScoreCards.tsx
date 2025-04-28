import React, { useMemo } from 'react';
import { ArrowUpFromDot, ArrowDownToDot, ArrowUpDown, MoveDownLeft, MoveUpRight, Move } from 'lucide-react';

const NodeScorecard = ({ title, value, icon: Icon, iconColor, unit }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex-1">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="p-2 rounded-full" style={{ backgroundColor: iconColor }}>
          <Icon size={16} className="text-white" />
        </div>
      </div>

      <div className="flex items-end">
        <div className="text-2xl font-medium">{value}</div>
        <span className="text-sm text-gray-400 ml-2">{unit}</span>
      </div>
    </div>
  );
};

const ConnectionScorecardsRow = ({ incomingConnections, outgoingConnections }) => {
  return (
    <div className="flex flex-col gap-4 w-full md:flex-row md:flex-wrap">
      <NodeScorecard
        title="Incoming Connections"
        value={incomingConnections}
        icon={MoveDownLeft}
        iconColor="#3E6445"
      />

      <NodeScorecard
        title="Outgoing Connections"
        value={outgoingConnections}
        icon={MoveUpRight}
        iconColor='#6f5a4c'
      />
    </div>
  );
};

const NodeScorecardsRow = ({ incomingValue, outgoingValue, netValue, unit }) => {
  return (
    <div className="flex flex-col gap-4 w-full md:flex-row md:flex-wrap">
      <NodeScorecard
        title="Incoming Flow"
        value={incomingValue}
        icon={ArrowDownToDot}
        iconColor="#3E6445"
        unit={unit}
      />

      <NodeScorecard
        title="Outgoing Flow"
        value={outgoingValue}
        icon={ArrowUpFromDot}
        iconColor='#6f5a4c'
        unit={unit}
      />

      <NodeScorecard
        title="Net Flow"
        value={netValue}
        icon={ArrowUpDown}
        iconColor="#01161E"
        unit={unit}
      />
    </div>
  );
};



// Example usage with sample data
const NodeVolumeScoreCards = ({ data, selected }: { data: any, selected: string }) => {

  function capitalizeWords(str) {
    // Handle edge cases
    if (!str) return '';

    // Split the string into words, capitalize each word, then join back together
    return str
      .split(' ')
      .map(word => {
        // Skip empty words
        if (!word) return '';
        // Capitalize the first letter and keep the rest of the word as is
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  const { nodes, edges } = data.elements;

  const nodeVolumes = useMemo(() => {
    const volumeData: NodeVolumeData = {};

    // Initialize all nodes with zero volumes
    nodes.forEach(node => {
      volumeData[node.data.id] = {
        incomingVolume: 0,
        outgoingVolume: 0
      };
    });

    // Calculate volumes from edges
    edges.forEach(edge => {
      const sourceId = edge.data.source;
      const targetId = edge.data.target;
      const volume = parseFloat(edge.data.yearly_volume.replace(/,/g, '')) || 0;

      // Add to outgoing volume for source node
      if (volumeData[sourceId]) {
        volumeData[sourceId].outgoingVolume += volume;
      }

      // Add to incoming volume for target node
      if (volumeData[targetId]) {
        volumeData[targetId].incomingVolume += volume;
      }
    });

    return volumeData;
  }, [nodes, edges]);

  const nodeConnections = useMemo(() => {
    const connectionData = {};

    // Initialize all nodes with zero connections
    nodes.forEach(node => {
      connectionData[node.data.id] = {
        incomingConnections: 0,
        outgoingConnections: 0
      };
    });

    // Count connections from edges
    edges.forEach(edge => {
      const sourceId = edge.data.source;
      const targetId = edge.data.target;

      // Add to outgoing connections for source node
      if (connectionData[sourceId]) {
        connectionData[sourceId].outgoingConnections += 1;
      }

      // Add to incoming connections for target node
      if (connectionData[targetId]) {
        connectionData[targetId].incomingConnections += 1;
      }
    });

    return connectionData;
  }, [nodes, edges]);

  const edgesWhereSelectedIsSource = useMemo(() => {
    return edges
      .filter(edge => edge.data.source === selected)
      .sort((a, b) => {
        const volumeA = parseFloat(a.data.yearly_volume.replace(/,/g, '')) || 0;
        const volumeB = parseFloat(b.data.yearly_volume.replace(/,/g, '')) || 0;
        return volumeB - volumeA;
      });
  }, [edges, selected]);

  const edgesWhereSelectedIsTarget = useMemo(() => {
    return edges
      .filter(edge => edge.data.target === selected)
      .sort((a, b) => {
        const volumeA = parseFloat(a.data.yearly_volume.replace(/,/g, '')) || 0;
        const volumeB = parseFloat(b.data.yearly_volume.replace(/,/g, '')) || 0;
        return volumeB - volumeA;
      });
  }, [edges, selected]);

  const incoming = useMemo(() => {
    const nodeData = nodeVolumes[selected];
    return nodeData ? nodeData.incomingVolume : 0;
  }, [nodeVolumes, selected]);

  const outgoing = useMemo(() => {
    const nodeData = nodeVolumes[selected];
    return nodeData ? nodeData.outgoingVolume : 0;
  }, [nodeVolumes, selected]);

  const incomingConnections = useMemo(() => {
    const nodeData = nodeConnections[selected];
    return nodeData ? nodeData.incomingConnections : 0;
  }, [nodeConnections, selected]);

  const outgoingConnections = useMemo(() => {
    const nodeData = nodeConnections[selected];
    return nodeData ? nodeData.outgoingConnections : 0;
  }, [nodeConnections, selected]);

  const selectedNode = useMemo(() => {
    return data.elements.nodes.find(node => node.data.id === selected);
  }, [data.elements.nodes, selected]);

  return (
    <div className="p-6 w-full">
      <NodeScorecardsRow
        incomingValue={incoming.toLocaleString()}
        outgoingValue={outgoing.toLocaleString()}
        netValue={(incoming - outgoing).toLocaleString()}
        unit={"gal"}
      />
      <div className="flex flex-col justify-left pt-8 space-y-4">
        <div>
          <h3 className="text-lg font-medium">{capitalizeWords(selectedNode.data.preliminary_type)} Details</h3>
        </div>
        {selectedNode.data.preliminary_type === 'water source' ? (
          <div className="flex justify-left flex-col space-y-4">
            <div>
              <b>Water Source:</b>&nbsp; {selectedNode.data.id}
            </div>
            <div className='flex'>
              <ConnectionScorecardsRow
                incomingConnections={incomingConnections}
                outgoingConnections={outgoingConnections}
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-left flex-col space-y-4">
            <div>
              <b>Water System:</b>&nbsp; {selectedNode.data.unified_name}
                {selectedNode.data['Water Use Survey Form Type'] && (
                <div>
                  <b>Water Use Survey Form Type:</b>&nbsp; {selectedNode.data['Water Use Survey Form Type']}
                </div>
                )}
                {selectedNode.data['TCEQ PWS Code'] && (
                <div>
                  <b>TCEQ PWS Code:</b>&nbsp; {selectedNode.data['TCEQ PWS Code']}
                </div>
                )}
                {selectedNode.data['PWS System Class'] && (
                <div>
                  <b>PWS System Class:</b>&nbsp; {selectedNode.data['PWS System Class']}
                </div>
                )}
                {selectedNode.data[' Population Served '] && (
                <div>
                  <b>Population Served:</b>&nbsp; {selectedNode.data[' Population Served ']}
                </div>
                )}
            </div>
            <div className='flex'>
              <ConnectionScorecardsRow
                incomingConnections={incomingConnections}
                outgoingConnections={outgoingConnections}
              />
            </div>
          </div>
        )}
      </div>
      {console.log(selectedNode.data)}

      {selectedNode.data.preliminary_type !== 'water source' && 
       edgesWhereSelectedIsTarget.length >= 1 && (
        <div className="flex flex-col justify-left pt-8">
          <h3 className="text-lg font-medium pb-4">Water Inflow into the System Ranked</h3>
          {/* edgesWhereSelectedIsTarget */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Source</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Target</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Yearly Volume (gal)</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Water Type</th>

                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Supply Method</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Type</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {edgesWhereSelectedIsTarget.map((row, index) => (
                  <tr key={row.data.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-2 px-4 text-sm text-gray-900">{row.data.source}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{row.data.target}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{row.data.yearly_volume}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{row.data.water_type}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{row.data.purchased_self}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{capitalizeWords(row.data.type)}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{row.data.year}</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {edgesWhereSelectedIsSource.length >= 1 && (
        <div className="flex flex-col justify-left pt-8">
          <h3 className="text-lg font-medium pb-4">Water Outflow out of the System Ranked</h3>
          {/* edgesWhereSelectedIsSource */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Source</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Target</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Yearly Volume (gal)</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Water Type</th>

                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Supply Method</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Type</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {edgesWhereSelectedIsSource.map((row, index) => (
                  <tr key={row.data.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-2 px-4 text-sm text-gray-900">{row.data.source}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{row.data.target}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{row.data.yearly_volume}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{row.data.water_type}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{row.data.purchased_self}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{capitalizeWords(row.data.type)}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{row.data.year}</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>)}
    </div>
  );
};

export default NodeVolumeScoreCards;