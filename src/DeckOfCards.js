import React, { useEffect, useState, useRef } from "react";
import Card from "./Card";
import axios from "axios";
import "./Deck.css";

const API_BASE_URL = "https://deckofcardsapi.com/api/deck";

function Deck() {
  //stores deck info
  const [deck, setDeck] = useState(null);
  //store cards that have been drawn starting as an empty array
  const [drawn, setDrawn] = useState([]);

  const [isShuffling, setIsShuffling] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  //reference for timer ID
  const timerRef = useRef(null);

  useEffect(() => {
    //sends GET req to API to get new shuffled deck
    async function fetchData() {
      let response = await axios.get(`${API_BASE_URL}/new/shuffle/`);
      setDeck(response.data);
    }
    fetchData();

    //empty array so effect only runs once
  }, []);

  useEffect(() => {
    async function fetchCard() {
      try {
        let response = await axios.get(`${API_BASE_URL}/${deck.deck_id}/draw/`);
        if (response.data.remaining === 0)
          throw new Error("Error: no cards remaining!");

        const card = response.data.cards[0];

        setDrawn((drawn) => [
          ...drawn,
          { id: card.code, name: card.suit + " " + card.value, image: card.image },
        ]);
      } catch (err) {
        setIsDrawing(false);
        alert(err);
      }
    }

    if (isDrawing && !timerRef.current) {
      timerRef.current = setInterval(fetchCard, 1000);
    } else if (!isDrawing && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isDrawing, deck]);

  useEffect(() => {
    async function shuffleDeck() {
      try {
        await axios.get(`${API_BASE_URL}/${deck.deck_id}/shuffle/`);
        setDrawn([]);
        setIsDrawing(false);
        setIsShuffling(false);
      } catch (err) {
        alert(err);
      }
    }

    if (isShuffling && deck) shuffleDeck();
  }, [isShuffling, deck]);

  function toggleDraw() {
    setIsDrawing((auto) => !auto);
  }

  function startShuffling() {
    return setIsShuffling(true);
  }

  function renderDrawBtnIfOk() {
    if (!deck) return null;

    return (
      <button
        className="Deck-gimme"
        onClick={toggleDraw}
        disabled={isShuffling}
      >
        {isDrawing ? "Stop " : "Keep "} drawing
      </button>
    );
  }

  function renderShuffleBtnIfOk() {
    if (!deck) return null;
    return (
      <button
        className="Deck-gimme"
        onClick={startShuffling}
        disabled={isShuffling}
      >
        Shuffle Deck
      </button>
    );
  }

  return (
    <main className="Deck">
      {renderDrawBtnIfOk()}
      {renderShuffleBtnIfOk()}
      <div className="Deck-cardarea">
        {drawn.map((c) => (
          <Card key={c.id} name={c.name} image={c.image} />
        ))}
      </div>
    </main>
  );
}

export default Deck;
