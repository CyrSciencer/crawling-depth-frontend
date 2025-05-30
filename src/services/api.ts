import axios from "axios";
import { useState } from "react";

const fetchData = async () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // console.log("here");
  //get data
  try {
    const response = await axios.get(
      "http://localhost:8000/api/v1/crawling-depth"
    );
    setData(response.data);
    setIsLoading(false);
    // console.log(search);
  } catch (error: any) {
    console.log(error.response);
  }
};
fetchData();
