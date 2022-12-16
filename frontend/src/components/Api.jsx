import React, { useState, useEffect } from "react"
import Images from './Images'
export default function Api() {
  const [img, setImg] = useState("")
  const [res, setRes] = useState([])
  const [cartres, cartSetRes] = useState([])
  const [famousRes, famousSetRes] = useState([])
  const [badImages, setBadImages] = useState([])
  const [famousImages, setFamousImages] = useState()
  useEffect(() => {
    fetch('/bad-images').then(response => response.json())
      .then(badImages => setBadImages(badImages))
  }, [])
  useEffect(() => {
    if (!img) return
    fetch(`/famous-image/${img}`).then(response => response.json())
      .then(famousImages => setFamousImages(famousImages))
  }, [img])

  const fetchRequestCartoon = async (newBadImages = badImages) => {
    const data = await fetch(`https://api.openverse.engineering/v1/images?q=cartoon%20${img}&category=illustration,digitized_artwork`, {
      method: 'GET',
      headers: {
        "Authorization": import.meta.env.VITE_OPENVERSE_AUTHKEY
      },
    })
    const dataJ = await data.json()
    const result = dataJ.results.filter(imageobject => {
      return !newBadImages.some(badImage => { return badImage.BadURL === imageobject.url })
    })
    //console.log(result, newBadImages)
    cartSetRes(result)
  }

  const fetchRequestReal = async (newBadImages = badImages) => {
    const data = await fetch(`https://api.openverse.engineering/v1/images?q=${img}`, {
      method: 'GET',
      headers: {
        "Authorization": import.meta.env.VITE_OPENVERSE_AUTHKEY
      },
    })
    const dataJ = await data.json()
    const result = dataJ.results.filter(imageobject => {
      return !newBadImages.some(badImage => { return badImage.BadURL === imageobject.url })
    })

    // console.log(result)
    setRes(result)
  }

  const fetchRequestFamous = async (newBadImages = badImages, newFamousImages = famousImages) => {
    const data = await fetch(`https://api.openverse.engineering/v1/images?q=${newFamousImages?.FamousURL}`, {
      method: 'GET',
      headers: {
        "Authorization": import.meta.env.VITE_OPENVERSE_AUTHKEY
      },
    })
    const dataJ = await data.json()
    const result = dataJ.results.filter(imageobject => {
      return !newBadImages.some(badImage => { return badImage.BadURL === imageobject.url })
    })
    // console.log(result)
    famousSetRes(result)
  }
  useEffect(() => {
    fetchRequestReal()
    fetchRequestCartoon()
  }, [img])
  useEffect(() => {
    fetchRequestFamous()
  }, [img, famousImages])

  const Submit = () => {
    fetchRequestReal()
    fetchRequestCartoon()
    fetchRequestFamous()
    setImg("")
  }
  const addBadImage = async (url, type) => {
    const response = await fetch('/BadImages/createBadImage', {
      headers: {
        "Content-Type": 'application/json'
      },
      method: 'POST', body: JSON.stringify({ BadURL: url })
    })
    const dataJ = await response.json()
    const newBadImages = [...badImages, dataJ]
    setBadImages(newBadImages)
    if (type === 'real') {
      fetchRequestReal(newBadImages)
    }
    else if (type === 'cartoon') {
      fetchRequestCartoon(newBadImages)
    }
    else if (type === 'famous') {
      fetchRequestFamous(newBadImages)
    }
    // console.log(type)
  }

  const addFamousImage = async (keyword) => {
    const response = await fetch('/famous-image/createFamousImage', {
      headers: {
        "Content-Type": 'application/json'
      },
      method: 'POST', body: JSON.stringify({ FamousURL: keyword, query: img })
    })
    const dataJ = await response.json()
    setFamousImages(dataJ);
    fetchRequestFamous(badImages, dataJ)

    // console.log(type)
  }
  return <div>
    <Images famous={famousRes[0]?.url} cartoon={cartres[0]?.url} real={res[0]?.url} keyword={img} addBadImage={addBadImage} famousTrueOrFalse={famousImages} />
    <form className="text-center"
      onSubmit={(e) => {
        e.preventDefault()
        setImg(e.target.elements[0].value)
      }

      }
    >
      <input
        className="col-3 form-control-sm py-1 fs-4 text-capitalize border border-3 border-dark"
        type="text"
        placeholder="Search Anything..."
      />
    </form>
    {!famousImages && <form onSubmit={(e) => {
      e.preventDefault()
      addFamousImage(e.target.elements[0].value)
    }
    }
      className="text-right pr-16 ">
      <input
        className="col-3 form-control-sm py-1 fs-4 text-capitalize border border-3 border-dark "
        type="text"
        placeholder="Please Enter The name of Famous thing you want" />
    </form>}
  </div>
}


