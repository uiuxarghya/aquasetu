const fetchStates = async (dataset: string) => {
  try {
    console.log("Fetching states with dataset:", dataset);
    const response = await fetch(
      `https://indiawris.gov.in/masterState/StateList`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ datasetcode: dataset }),
      }
    );
    console.log("States API response status:", response.status);
    const resp = await response.json();
    console.log("States API response:", resp);
    return resp.data;
  } catch (error) {
    console.error("Error fetching states:", error);
    return null;
  }
};

const getDistrictByState = async (stateCode: string, datasetcode: string) => {
  try {
    console.log(
      "Fetching districts for state:",
      stateCode,
      "dataset:",
      datasetcode
    );
    const response = await fetch(
      `https://indiawris.gov.in/masterDistrict/getDistrictbyState`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ statecode: stateCode, datasetcode }),
      }
    );
    console.log("Districts API response status:", response.status);
    const resp = await response.json();
    console.log("Districts API response:", resp);
    return resp.data;
  } catch (error) {
    console.error("Error fetching districts:", error);
    return null;
  }
};

const getTahsilList = async (
  statecode: string,
  district_id: string,
  datasetcode: string
) => {
  try {
    console.log(
      "Fetching tahsils for state:",
      statecode,
      "district:",
      district_id,
      "dataset:",
      datasetcode
    );
    const response = await fetch(
      `https://indiawris.gov.in/tehsil/getMasterTehsilList`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ statecode, district_id, datasetcode }),
      }
    );
    console.log("Tahsils API response status:", response.status);
    const resp = await response.json();
    console.log("Tahsils API response:", resp);
    return resp.data;
  } catch (error) {
    console.error("Error fetching tahsils:", error);
    return null;
  }
};

const getBlockList = async (
  statecode: string,
  district_id: string,
  tahsil_id: string,
  datasetcode: string
) => {
  try {
    const response = await fetch(
      `https://indiawris.gov.in/block/getMasterBlockList`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          statecode,
          district_id,
          tahsil_id,
          datasetcode,
        }),
      }
    );
    const resp = await response.json();
    return resp.data;
  } catch (error) {
    console.error("Error fetching blocks:", error);
  }
};

const getAgencyList = async (
  district_id: string,
  datasetcode: string,
  localriverid: string,
  tributaryid: string,
  tahsil_id: string,
  block_id: string
) => {
  try {
    const response = await fetch(
      `https://indiawris.gov.in/masterAgency/AgencyListInAnyCase`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          district_id,
          datasetcode,
          localriverid,
          tributaryid,
          tahsil_id,
          block_id,
        }),
      }
    );
    const resp = await response.json();
    return resp.data;
  } catch (error) {
    console.error("Error fetching agencies:", error);
  }
};

const getMasterStation = async (
  district_id: string,
  agencyid: string,
  datasetcode: string
) => {
  try {
    const response = await fetch(
      `https://indiawris.gov.in/masterStation/getMasterStation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ district_id, agencyid, datasetcode }),
      }
    );
    const resp = await response.json();
    return resp.data;
  } catch (error) {
    console.error("Error fetching master stations:", error);
  }
};

const getStationDSList = async (
  district_id: string,
  agencyid: string,
  datasetcode: string,
  telemetric: string
) => {
  try {
    const response = await fetch(
      `https://indiawris.gov.in/masterStationDS/stationDSList`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          district_id,
          agencyid,
          datasetcode,
          telemetric,
        }),
      }
    );
    const resp = await response.json();
    return resp.data;
  } catch (error) {
    console.error("Error fetching station DS list:", error);
  }
};

export {
  fetchStates,
  getDistrictByState,
  getTahsilList,
  getBlockList,
  getAgencyList,
  getMasterStation,
  getStationDSList,
};
