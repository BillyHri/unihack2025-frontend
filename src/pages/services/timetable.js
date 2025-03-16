import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getSuggestion } from "./room";
import { toast } from "react-toastify";

const localizer = momentLocalizer(moment);

export const CustomToolbar = (toolbar) => {
  return (
    <div className="rbc-toolbar" style={{ marginBottom: "20px" }}>
      {/* Navigation Buttons */}
      <span className="rbc-btn-group">
        <button
          onClick={() => toolbar.onNavigate("PREV")}
          style={buttonStyle}
        >
          ◀
        </button>
        <button
          onClick={() => toolbar.onNavigate("TODAY")}
          style={buttonStyle}
        >
          Today
        </button>
        <button
          onClick={() => toolbar.onNavigate("NEXT")}
          style={buttonStyle}
        >
          ▶
        </button>
      </span>

      {/* View Label */}
      <span
        className="rbc-toolbar-label"
        style={{
          fontSize: "1.4em",
          fontWeight: "600",
          color: "#2c3e50",
        }}
      >
        {toolbar.label}
      </span>

      {/* View Buttons (Month, Week, Day, Agenda) */}
      <span className="rbc-btn-group">
        <button
          className={toolbar.view === "month" ? "active" : ""}
          onClick={() => toolbar.onView("month")}
          style={buttonStyle}
        >
          Month
        </button>
        <button
          className={toolbar.view === "week" ? "active" : ""}
          onClick={() => toolbar.onView("week")}
          style={buttonStyle}
        >
          Week
        </button>
        <button
          className={toolbar.view === "day" ? "active" : ""}
          onClick={() => toolbar.onView("day")}
          style={buttonStyle}
        >
          Day
        </button>
        <button
          className={toolbar.view === "agenda" ? "active" : ""}
          onClick={() => toolbar.onView("agenda")}
          style={buttonStyle}
        >
          Agenda
        </button>
      </span>
    </div>
  );
};

function GroupCalendar({ free_times }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [suggested, setSuggested] = useState(null);
  const [view, setView] = useState("week");

  useEffect(() => {
    const formattedEvents = free_times.map((event, index) => {
      let arr = Object.keys(event.free_users);
      let description_add = "";
      let names = [];
      arr.forEach((id) => {
          names.push(event.free_users[id].name);
      });

      if (names.length > 1) {
          description_add += " " + names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
      } else {
          description_add += " " + names[0];
      }
      return {
        id: index + 1,
        title: event.summary,
        start: new Date(event.start_time_iso),
        end: new Date(event.end_time_iso),
        users: event.free_users,
        description: "You have free time with: " + description_add,
      };
    });
    setEvents(formattedEvents);
  }, [free_times]);

  useEffect(() => {
    if (selectedEvent && selectedEvent.suggestion == null) {
      toast.promise(
        getSuggestion(selectedEvent.users, selectedEvent.start)
          .then((data) => setSuggested(data.suggested_location)),
        {
          pending: "Asking AI for suggestions...",
          success: "AI suggestions fetched!",
          error: "Failed to fetch AI suggested events.",
        }
      );
    } else {
      setSuggested(null);
    }
  }, [selectedEvent]);

  const eventStyleGetter = (event) => {
    const duration = moment(event.end).diff(moment(event.start), "minutes");
    const backgroundColor = duration > 120 ? "#22aa84ab" : "#3b82f633";
    const textColor = duration > 120 ? "#fff" : "#3b82f6";
    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        border: "none",
        color: textColor,
        fontSize: "0.9em",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      },
    };
  };

  return (
    <div className="flex justify-center mt-12">
      {/* Wrapper div for rounded white background */}
      <div
        style={{
          backgroundColor: "#EEF1FA",
          borderRadius: "15px",
          padding: "20px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          width: "80vw",
          maxWidth: "1200px",
        }}
      >
        {/* Calendar Component */}
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          onView={setView}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={(event) => setSelectedEvent(event)}
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
          }}
          style={{ height: 650}}
          className="w-full"
          defaultView="week"
          min={new Date(2025, 2, 16, 8, 0)}
          max={new Date(2025, 2, 16, 20, 0)}
        />
      </div>
      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="bg-gradient-to-r from-teal-200 to-teal-500 text-white"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
          }}
        >
          <h3 className="text-lg font-semibold w-full text-center">
            Congratulations!
          </h3>
          <p className="text-sm text-gray-600">{selectedEvent.description}</p>
          <p className="text-sm text-gray-600">
            {moment(selectedEvent.start).format("LLL")} -{" "}
            {moment(selectedEvent.end).format("LLL")}
          </p>
          <p className="text-sm text-gray-600">{suggested}</p>
          <button
            type="submit"
            onClick={() => setSelectedEvent(null)}
            className="  mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Close
          </button>
        </div>
      )}

      {/* Overlay to close modal when clicking outside */}
      {selectedEvent && (
        <div
          onClick={() => setSelectedEvent(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 999,
          }}
        />
      )}
    </div>
  );
}

// Button styling for the toolbar
export const buttonStyle = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #e0e0e0",
  borderRadius: "6px",
  padding: "6px 12px",
  margin: "0 4px",
  cursor: "pointer",
  transition: "all 0.3s ease",
};

export default GroupCalendar;
