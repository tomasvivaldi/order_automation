import { useState, useRef, useEffect } from "react";
import React from "react";
import styles from "../styles";

const App = () => {
  const [customer, setCustomer] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const [pickupDate, setPickupDate] = useState("");

  const [dropoffDate, setDropoffDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [dropoffTime, setDropoffTime] = useState("");
  const [units, setUnits] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [conversation, setConversation] = useState("");
  const [buttonText, setButtonText] = useState("Start Listening");
  const [submitButtonColor, setSubmitButtonColor] = useState("green");
  const [buttonPressed, setButtonPressed] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [totalLineHaul, setTotalLineHaul] = useState("");
  const [fuelSurcharge, setFuelSurcharge] = useState("");
  const [otherFees, setOtherFees] = useState("");
  const [total, setTotal] = useState("");
  const final_conversation = useRef("");
  const [currencyValue, setcurrency] = useState("");
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const otherFeesValue =
    otherFees.startsWith("$") && otherFees.length > 1
      ? parseInt(otherFees.substring(1))
      : 0;
  const totalValue = totalLineHaul + fuelSurcharge + otherFeesValue;
  const totalWithDollarSign = `$${totalValue}`;
  const totalLineHaulWithDollarSign = `$${totalLineHaul}`;
  const fuelSurchargeWithDollarSign = `$${fuelSurcharge}`;
  const otherFeesWithDollarSign = `$${otherFees}`;
  const formattedValue = currencyFormatter.format(currencyValue);
  console.log(formattedValue); // Output: $1,234.56
  const fontStyles = {
    fontFamily: "monospaced, sans-serif",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#0066FF",
  };

  useEffect(() => {
    if (!recognition) {
      const newRecognition = new window.webkitSpeechRecognition();
      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      newRecognition.lang = "en-US";
      newRecognition.onresult = (event) => {
        let final_transcript = "";
        let draft_transcript = "";
        let has_final = false;
        let has_non_final = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
            has_final = true;
          } else {
            draft_transcript += event.results[i][0].transcript;
            has_non_final = true;
          }
        }
        if (has_final) {
          final_conversation.current =
            final_conversation.current + final_transcript;
          setConversation(final_conversation.current);
        } else {
          setConversation(final_conversation.current + draft_transcript);
        }
        if (has_final) {
          parseData(final_conversation);
        }
      };

      newRecognition.onerror = (event) => {
        if (recognition) {
          recognition.stop();
        }
      };

      setRecognition(newRecognition);
    }
  }, [recognition]);

  const formSubmit = (event) => {
    event.preventDefault();
  };

  const parseData = (running_transcript) => {
    // const gptKey = process.env.REACT_APP_GPT_API_KEY;
    const gptKey = "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";

    var prompt =
      "What is company name, source address, destination address, " +
      " pickup day, pickup month, pickup year, pickup time, dropoff day, dropoff month, dropoff year, dropoff time, " +
      " number of units, weight and description of shipment " +
      " as per this conversation:\n\n " +
      running_transcript.current;
    console.log("Prompt", prompt);

    fetch("https://api.openai.com/v1/engines/text-davinci-003/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${gptKey}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        temperature: 0,
        max_tokens: 256,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success", data);
        const text_response = data.choices[0].text;
        const lines = text_response.split("\n");
        const temp_dict = {};

        lines.forEach((line2) => {
          console.log("chatgpt response.data.choices[0] lines2 :" + line2);
        });

        lines.forEach((line) => {
          console.log("chatgpt response.data.choices[0] lines :" + line);
          if (line.toLowerCase().startsWith("company name: ")) {
            temp_dict["customer"] = line.slice(14);
            setCustomer(temp_dict["customer"]);
          }
          if (line.toLowerCase().startsWith("source address: ")) {
            temp_dict["source"] = line.slice(16);
            setSource(temp_dict["source"]);
          }
          if (line.toLowerCase().startsWith("destination address: ")) {
            temp_dict["destination"] = line.slice(21);
            setDestination(temp_dict["destination"]);
          }
          if (line.toLowerCase().startsWith("weight: ")) {
            temp_dict["weight"] = line.slice(8);
            setWeight(temp_dict["weight"]);
          }
          if (line.toLowerCase().startsWith("number of units: ")) {
            temp_dict["unit"] = line.slice(17);
            setUnits(temp_dict["unit"]);
          }
          if (line.toLowerCase().startsWith("description of shipment: ")) {
            temp_dict["description"] = line.slice(25);
            setDescription(temp_dict["description"]);
          }
          if (line.toLowerCase().startsWith("pickup day: ")) {
            temp_dict["pickupDay"] = line.slice(12);
          }
          if (line.toLowerCase().startsWith("pickup month: ")) {
            temp_dict["pickupMonth"] = line.slice(14);
          }
          if (line.toLowerCase().startsWith("pickup year: ")) {
            temp_dict["pickupYear"] = line.slice(13);
          }
          if (line.toLowerCase().startsWith("pickup time: ")) {
            temp_dict["pickupTime"] = line.slice(13);
          }
          // if (line.toLowerCase().startsWith("dropoff date: ")) {
          //     temp_dict["dropoffDate"] = line.slice(14);
          //     setPickupDate(temp_dict["dropoffDate"]);
          // }
          if (line.toLowerCase().startsWith("dropoff day: ")) {
            temp_dict["dropoffDay"] = line.slice(13);
          }
          if (line.toLowerCase().startsWith("dropoff month: ")) {
            temp_dict["dropoffMonth"] = line.slice(15);
          }
          if (line.toLowerCase().startsWith("dropoff year: ")) {
            temp_dict["dropoffYear"] = line.slice(14);
          }
          if (line.toLowerCase().startsWith("dropoff time: ")) {
            temp_dict["dropoffTime"] = line.slice(14);
            setDropoffTime(temp_dict["dropoffTime"]);
            setPickupTime(temp_dict["pickupTime"]);
          }
          if ((temp_dict["weight"] !== "", temp_dict["unit"] !== "")) {
            setTotalLineHaul(
              parseInt(temp_dict["unit"]) *
                parseFloat(temp_dict["weight"]) *
                0.3
            );
            setFuelSurcharge(parseFloat(temp_dict["weight"]));
            setTotal(totalValue);
          }
        });
        if (
          temp_dict["pickupYear"] != null &&
          temp_dict["pickupMonth"] != null &&
          temp_dict["pickupDay"] != null &&
          temp_dict["pickupYear"].trim() !== "" &&
          temp_dict["pickupMonth"].trim() !== "" &&
          temp_dict["pickupDay"].trim() !== "" &&
          temp_dict["pickupYear"] !== "TBD" &&
          temp_dict["pickupMonth"] !== "TBD" &&
          temp_dict["pickupDay"] !== "TBD"
        ) {
          setPickupDate(
            temp_dict["pickupMonth"] +
              "/" +
              temp_dict["pickupDay"] +
              "/" +
              temp_dict["pickupYear"]
          );
        }
        if (
          temp_dict["dropoffYear"] != null &&
          temp_dict["dropoffMonth"] != null &&
          temp_dict["dropoffDay"] != null &&
          temp_dict["dropoffYear"].trim() !== "" &&
          temp_dict["dropoffMonth"].trim() !== "" &&
          temp_dict["dropoffDay"].trim() !== "" &&
          temp_dict["dropoffYear"] !== "TBD" &&
          temp_dict["dropoffMonth"] !== "TBD" &&
          temp_dict["dropoffDay"] !== "TBD"
        ) {
          setDropoffDate(
            temp_dict["dropoffMonth"] +
              "/" +
              temp_dict["dropoffDay"] +
              "/" +
              temp_dict["dropoffYear"]
          );
        }
      })
      .catch((error) => {
        // Handle any errors
        console.log("ERROR *********");
        console.error(error);
      });
  };

  const handleSpeechRecognition = () => {
    if (recognition) {
      if (!buttonPressed) {
        setSubmitButtonColor("red");
        setButtonText("Stop Listening");
        recognition.start();
      } else {
        setSubmitButtonColor("green");
        setButtonText("Start Listening");
        recognition.stop();
      }
    }
    setButtonPressed((prevButtonPressed) => !prevButtonPressed);
  };

  return (
    <div className="App">
      <section>
        <div style={{ display: "flex", width: "100%", heigth: "100vh" }}>
          <form
            style={{
              marginInlineEnd: "10px",
              width: "70%",
              padding: "20px",
              background: "#F8F7FD",
              borderRadius: "20px",
            }}
            method="POST"
            onSubmit={(e) => formSubmit(e)}
          >
            <h4 style={fontStyles}>Order #12345</h4>

            <div style={{ paddingBlockEnd: "10px" }}>
              Customer
              <br />
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                required
                style={styles.input}
              />
              <br />
            </div>
            <div style={{ display: "flex", paddingBlockEnd: "20px" }}>
              <div style={{ flex: 1, paddingInlineEnd: "20px" }}>
                Source Location
                <br />
                <input
                  type="text"
                  name="source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  required
                  style={styles.input}
                />
                <br />
              </div>
              <div style={{ flex: 1 }}>
                Destination Location
                <br />
                <input
                  type="text"
                  name="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  style={styles.input}
                />
                <br />
              </div>
            </div>
            <div style={{ display: "flex", paddingBlockEnd: "20px" }}>
              <div style={{ flex: 1, paddingInlineEnd: "20px" }}>
                Pick up date
                <br />
                <input
                  type="text"
                  name="Pick up date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  required
                  style={styles.input}
                />
                <br />
              </div>
              <div style={{ flex: 1 }}>
                Drop off date
                <br />
                <input
                  type="text"
                  name="Drop off date"
                  value={dropoffDate}
                  onChange={(e) => setDropoffDate(e.target.value)}
                  required
                  style={styles.input}
                />
                <br />
              </div>
            </div>
            <div style={{ display: "flex", paddingBlockEnd: "20px" }}>
              <div style={{ flex: 1, paddingInlineEnd: "20px" }}>
                Pick up time
                <br />
                <input
                  type="text"
                  name="Pick up time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  required
                  style={styles.input}
                />
                <br />
              </div>
              <div style={{ flex: 1 }}>
                Drop off time
                <br />
                <input
                  type="text"
                  name="Drop off time"
                  value={dropoffTime}
                  onChange={(e) => setDropoffTime(e.target.value)}
                  required
                  style={styles.input}
                />
                <br />
              </div>
            </div>

            <div style={{}}>
              <strong>Load Information</strong>
              <br />
              <br />
              <div style={{ display: "flex" }}>
                <div style={{ flex: 1 }}>Shipping Units</div>
                <div style={{ flex: 1 }}>Description</div>
                <div style={{ flex: 1 }}>Weight</div>
              </div>
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    flex: 1,
                    paddingBlock: "10px",
                    marginInlineEnd: "20px",
                  }}
                >
                  <input
                    type="text"
                    name="units"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
                <div
                  style={{
                    flex: 1,
                    paddingBlock: "10px",
                    marginInlineEnd: "20px",
                  }}
                >
                  <input
                    type="text"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
                <div
                  style={{
                    flex: 1,
                    paddingBlock: "10px",
                    marginInlineEnd: "10px",
                  }}
                >
                  <input
                    type="text"
                    name="weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
              </div>
              <br />
            </div>
            <h4>Carrier Charges</h4>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                paddingBlockEnd: "10px",
                justifyContent: "space-between",
              }}
            >
              <p style={{ width: "300px" }}> Total line haul ($) </p>
              <br />
              <input
                type="currencyValue"
                value={totalLineHaulWithDollarSign}
                required
                style={{
                  width: "30%",
                  textAlign: "right",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
              <br />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                paddingBlockEnd: "10px",
                justifyContent: "space-between",
              }}
            >
              <p style={{ width: "300px" }}>Fuel Surcharge ($) </p>
              <br />
              <input
                type="text"
                value={fuelSurchargeWithDollarSign}
                required
                style={{
                  width: "30%",
                  textAlign: "right",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
              <br />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                paddingBlockEnd: "10px",
                justifyContent: "space-between",
              }}
            >
              <p style={{ width: "300px" }}>Lumper and other fees ($)</p>
              <br />
              <input
                type="text"
                value={"$" + otherFeesValue}
                onChange={(e) => setOtherFees(e.target.value)}
                required
                style={{
                  width: "30%",
                  textAlign: "right",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
              <br />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                paddingBlockEnd: "10px",
                justifyContent: "space-between",
              }}
            >
              <strong style={{ width: "300px" }}>Total ($)</strong>
              <br />
              <input
                type="text"
                value={totalWithDollarSign}
                required
                style={{
                  width: "30%",
                  textAlign: "right",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
              <br />
            </div>
            <input
              type="submit"
              value="Submit"
              style={{
                backgroundColor: "#0066FF",
                color: "white",
                padding: "10px 20px",
                fontSize: "16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            />
          </form>
          <div
            style={{
              marginInlineStart: "10px",
              width: "50%",
              height: "100vh",
              padding: "10px",
              borderRadius: "5px",
              backgroundColor: "white",
              color: "black",
            }}
          >
            <button
              type="button"
              style={{
                width: "100%",
                display: "inline-block",
                padding: "10px",
                borderRadius: "5px",
                backgroundColor: submitButtonColor,
                color: "white",
              }}
              onClick={handleSpeechRecognition}
            >
              {buttonText}
            </button>
            <h1>{conversation}</h1>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
