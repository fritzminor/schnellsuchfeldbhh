import * as React from "react";

export function SearchFieldsContainer():JSX.Element { //eslint-disable-line no-undef
 return (
  <div className="container searchfields">
    <div className="field">
      <label className="label">Epl</label>
      <div className="control">
        <div className="fieldprefix">von</div>
        <input
          className="input"
          type="number"
          placeholder="01"
        />
        <div>bis</div>
        <input
          className="input"
          type="number"
          placeholder="01"
        />
      </div>
    </div>
  </div>)
}