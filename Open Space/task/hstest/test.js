const puppeteer = require('puppeteer');
const path = require('path');
// '..' since we're in the test/ subdirectory; learner is supposed to have src/index.html
const pagePath = 'file://' + path.resolve(__dirname, '../src/index.html');

const hs = require('hs-test-web');

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function stageTest() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args:['--start-maximized']
    });

    const page = await browser.newPage();
    await page.goto(pagePath);

    page.on('console', msg => console.log(msg.text()));

    await sleep(1000);

    let result = await hs.testPage(page,
        //testing structure of the page
        () => {
            let body = document.getElementsByTagName("body")[0];
            if (!(body && body.children.length === 1 &&
                body.children[0].tagName.toLowerCase() === 'div' &&
                body.children[0].className === 'space')
            ) return hs.wrong("There are some mismatches with suggested structure or elements naming")

            let space = body.children[0];
            if (!(space.children.length === 2 &&
                space.children[0].tagName.toLowerCase() === 'div' && space.children[1].tagName.toLowerCase() === 'div' &&
                ( space.children[0].className === 'planet-area' && space.children[1].className === 'control-panel' ||
                    space.children[1].className === 'planet-area' && space.children[0].className === 'control-panel'))
            ) return hs.wrong("There are some mismatches with suggested structure or elements naming on the space section level")

            let planetArea = document.getElementsByClassName('planet-area')[0]
            if (!(planetArea.children.length === 2 &&
                planetArea.children[0].tagName.toLowerCase() === 'img' &&
                planetArea.children[1].tagName.toLowerCase() === 'img' && (
                    planetArea.children[0].className === 'planet' && planetArea.children[1].className === 'rocket' ||
                    planetArea.children[1].className === 'planet' && planetArea.children[0].className === 'rocket'))
            )return hs.wrong("There are some mismatches with suggested structure or elements naming in planet-area section")

            let controlPanel = document.getElementsByClassName('control-panel')[0];
            let controlPanelInner = Array.from(controlPanel.children)[0]
            if (!(controlPanelInner.children.length === 5 &&
                controlPanelInner.getElementsByTagName('input').length === 14 &&
                controlPanelInner.getElementsByTagName('div').length === 2
            )) return hs.wrong("There are some mismatches with suggested structure or elements naming in control-panel section")

            return hs.correct()
        },
        //testing types of the check-buttons inputs
        () => {
            let checkBtnsDiv = document.getElementsByClassName("check-buttons");
            let checkBtns = Array.from(checkBtnsDiv[0].children);
            checkBtns.forEach( el => {
                if (el.tagName.toLowerCase() !== 'input' || el.type.toLowerCase() !== 'checkbox') {
                    return hs.wrong('Each element in the check-buttons div should be an input with checkbox type')
                }
            })

            return hs.correct();
        },
        //testing types of the levers inputs
        () => {
            let leversDiv = document.getElementsByClassName("levers");
            let leversInputs = Array.from(leversDiv[0].children);
            leversInputs.forEach( el => {
                if (el.tagName.toLowerCase() !== 'input' || el.type.toLowerCase() !== 'range') {
                    return hs.wrong('Each element in the levers div should be an input with range type')
                }
            })

            return hs.correct();
        },
        //testing background of space
        () => {
            let space = document.getElementsByClassName("space");
            let spaceBg = window.getComputedStyle(space[0]).backgroundImage;
            if (!spaceBg) return hs.wrong("The element with class='space' should have background-image.");

            return hs.correct();
        },
        //testing gradient background of the panel
        () => {
            let controlDeck = document.getElementsByClassName("control-panel")[0];
            let controlDeckBgImg = window.getComputedStyle(controlDeck).backgroundImage;
            if (!controlDeckBgImg.toLowerCase().includes('linear-gradient')) return hs.wrong("The element with class='control-panel' should have gradient background.");

            return hs.correct();
        },
        //testing positioning of check-buttons and levers
        /*display: flex;
    flex-direction: row;*/
        () => {
            let checkBtnsDiv = document.getElementsByClassName("check-buttons")[0];
            let leversDiv = document.getElementsByClassName("levers")[0];

            let checkBtnsDivStyles = window.getComputedStyle(checkBtnsDiv);
            let leversDivStyles = window.getComputedStyle(leversDiv);

            if (checkBtnsDivStyles.display.toLowerCase() !== 'flex' || leversDivStyles.display.toLowerCase() !== 'flex') {
                return hs.wrong('Elements check-buttons and levers should have display: flex property.')
            }

            if (checkBtnsDivStyles.flexDirection.toLowerCase() !== 'row' || leversDivStyles.flexDirection.toLowerCase() !== 'row') {
                return hs.wrong('Elements check-buttons and levers should be positioned in a row.')
            }

            return hs.correct();
        },
        //testing that levers positioned vertical
        () => {
            let leversDiv = document.getElementsByClassName('levers')[0];
            let levers = Array.from(leversDiv.getElementsByTagName('input'));
            levers.forEach( lever => {
                let leverStyle = window.getComputedStyle(lever);
                if (!leverStyle.transform) return hs.wrong("All levers should be vertical.")
            })

            return hs.correct();
        },
        //testing password field
        () => {
            let controlPanelInner = document.getElementsByClassName('control-panel__inner')[0];
            let msg = undefined;
            for(let el of Array.from(controlPanelInner.children)){
                if (el.tagName.toLowerCase() === 'input' && el.type.toLowerCase() === 'password') {
                    let styles = window.getComputedStyle(el);
                    if (styles.color && styles.border ) return  hs.correct()
                    else return hs.wrong("Password field's border and text color should be changed");
                }
            }

            return hs.wrong("Can't find password field");
        },
        //testing the background color of the "ok" and "launch" buttons
        () => {
            let controlPanelInner = document.getElementsByClassName('control-panel__inner')[0];
            let counter = 0;
            for(let el of Array.from(controlPanelInner.children)){
                if (el.tagName.toLowerCase() === 'input' && (el.type.toLowerCase() === 'submit' || el.type.toLowerCase() === 'button')) {
                    let styles = window.getComputedStyle(el);
                    if (styles.backgroundColor) {
                        counter++;
                    }

                }
            }

            return counter === 2
                ? hs.correct()
                : hs.wrong("Can't find 2 input fields with type=button or submit with changed background");
        },
        //testing the form of the launch button
        () => {
            let controlPanelInner = document.getElementsByClassName('control-panel__inner')[0];
            for(let el of Array.from(controlPanelInner.children)){
                if (el.tagName.toLowerCase() === 'input' && (el.type.toLowerCase() === 'submit' || el.type.toLowerCase() === 'button')) {
                    let styles = window.getComputedStyle(el);
                    if (styles.backgroundColor && styles.borderRadius) {
                        return hs.correct();
                    }
                }
            }

            return hs.wrong("Can't find the input with type=button or submit with specified border-radius");
        }
    )

    await browser.close();
    return result;
}

jest.setTimeout(30000);
test("Test stage", async () => {
        let result = await stageTest();
        if (result['type'] === 'wrong') {
            fail(result['message']);
        }
    }
);
