import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"
import Header from "./Header";
import '../App.css';
import '../SelectEvent.css';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

interface Obj {
  [prop: string]: any // 『[prop: string]: any』を記述してあげることでどんなプロパティも持てるようになります。
  [prop: number]: any // 『[prop: string]: any』を記述してあげることでどんなプロパティも持てるようになります。
}

interface Training {
  item: any,
  bodyValue: any
  onChange: (event: React.SyntheticEvent, newValue: number) => void
}

const SelectEvents = (props: Training) => {
  return (
    <>
      <Box className="selectEventsArea" sx={{ bgcolor: 'paper' }}>
        <Tabs
          value={props.bodyValue}
          onChange={props.onChange}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
          aria-label="scrollable force tabs example"
        >
          <Tab label="よくやる種目" />
          <Tab label="胸" />
          <Tab label="背中" />
          <Tab label="肩" />
          <Tab label="腕" />
          <Tab label="腹" />
          <Tab label="足" />
          <Tab label="有酸素運動" />
        </Tabs>
      </Box>
    </>
  )
}

const DispEventListDetail = (props: Obj) => {
  const navigate = useNavigate();
  let setStateVal = {
    'bodyCode': props.data.body_code,
    'eventCode': props.data.trainingEvents_code,
    'eventName': props.data.trainingEvents_name,
  };

  return (
    <>
      <ListItemButton onClick={() => navigate('/training/register', {state: setStateVal})}>
        <ListItemText primary={props.data.trainingEvents_name} />
      </ListItemButton>
      <Divider />
    </>
  );
}

const DispEventList = (props: any) => {
  let trainingEventLists = props.item.filter((eventItem: Obj) => {
    return eventItem.body_code === props.bodyValue;
  });
  return (
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', margin: 'auto' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
    {trainingEventLists.map((trainingData: any, index: number) => {
      return <DispEventListDetail data={trainingData} key={trainingData.trainingEvents_code}/>
    })}
    </List>
  );
}

const App = () => {
  const [trainingDetailData, setTrainingDetailData] = useState<Obj>([]);
  const URL = `/api/getAllEventItems`;

  const [selectBodyValue, setBodyValue] = useState(1); // デフォルトは「胸」としておく
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setBodyValue(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        fetch(URL)
        .then(res => res.json())
        .then(result => {
          setTrainingDetailData(result);
        })
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [URL]);

  return (
    <>
      <Header />
      <SelectEvents
        item={trainingDetailData}
        bodyValue={selectBodyValue}
        onChange={handleChange}
      />
      <div className="dispEventListArea">
        <DispEventList
          item={trainingDetailData}
          bodyValue={selectBodyValue}
          key={trainingDetailData.event_code}
        />
      </div>
    </>
  );
};

export default App;