import React, {useState, useEffect, useRef} from 'react';
import { VictoryBar, VictoryChart, VictoryTooltip, VictoryVoronoiContainer  } from "victory";
import '../styles/reports.css'
import SocketIo from 'socket.io-client';

const ChartVictory = () => {
    const [dataChart, setDataChart] = useState([]);
    const myIo = useRef();

    useEffect(() => {

        myIo.current = SocketIo();
        myIo.current.emit('getDataChart');

        return () => {
            myIo.current.disconnect();
        }
    }, [])

    useEffect(() => {
        myIo.current.off('senDataChart');
        myIo.current.on('senDataChart', (data) => {
            setDataChart(data);
        })
    }, [dataChart])

    return (
        <div className="reports-chart">
            <div className="heading">
                <h3>Reports</h3>
                <p>
                    This chart presents followers of each vacation.<br/>
                    <b>X</b> - vacation id, <b>Y</b> - number of followers.
                </p>
            </div>
            <VictoryChart domainPadding={20} containerComponent={<VictoryVoronoiContainer/>}>
                <VictoryBar
                    labels={({ datum }) => `vacation ${datum.id_vacation}\nfollowers: ${datum.followers}`}
                    labelComponent={
                        <VictoryTooltip 
                            style={{
                            fill: "#868C97",
                            fontSize: 10,
                            fontWeight: 500,
                            textAnchor: "middle"
                            }}
                            flyoutStyle={{
                                stroke: "#868C97",
                                strokeWidth: 1,
                                fill: "#FFFFFF"
                            }}
                        />}
                    data={dataChart}
                    // data accessor for x values
                    x="id_vacation"
                    // data accessor for y values
                    y="followers"
                    style={{
                    data: {fill: "#008cba", width: 30}
                    }}
                />
            </VictoryChart>
        </div>
    )
}

export default ChartVictory;