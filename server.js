const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const fs = require('fs');

//URL da pagina a ser buscada;
const url = 'https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops';

app.get('/', async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  const pageData = await page.evaluate(() => {
    const data = [];
		const elements = document.querySelectorAll('.thumbnail');

    //Separar os dados que vem dos elements
    for(var element of elements){
			const textSplit = element.childNodes[3].innerText.split("\n");
			const price = textSplit[0];
			const title = textSplit[1];
			const description = textSplit[3].replace('\"', '"');
			const image = element.childNodes[1].src;
      const ratings = element.childNodes[5].innerText.replace('\n\n','');
      const startnumber = element.childNodes[5].childNodes[3].childElementCount

			//Mandar os dados somente dos laptops Lenovo para o array 
      if(title.indexOf("Lenovo") != -1){
				data.push({image, price, title, description, ratings, startnumber});
			}
		}

    return data;
  });

  //Mandar os dados coletados para um json
  fs.writeFile('laptops.json', JSON.stringify(pageData, null, 2), err =>{
		if(err) throw new Error('Something went wrong');
	});

  await browser.close();
  console.log('Bot finalizado!');

  //Mostrar dados na tela; 
  res.send(
    pageData.map(element => ({
      image: element.image,
      title: element.title,
      price: element.price,
      description: element.description,
      ratings: element.ratings,
      startnumber: element.startnumber
    }))
  )
});


app.listen(3000, () => {
  console.log("servidor subiu com sucesso! Acesse em http://localhost:3000")
});