/*
 * Title    : Js For Fireworks
 * Author   : Fc_404
 * Date     : 2021-09-14
 * Describe :
 */

const PIPI = 2 * Math.PI
const PIR = PIPI / 360

const addCanvas = function () {
    var el = document.createElement('canvas')
    el.height = window.innerHeight
    el.width = window.innerWidth
    el.style.padding = 0
    el.style.margin = 0
    el.style.position = 'fixed'
    el.style.top = 0
    el.style.left = 0
    el.style.backgroundColor = 'rgba(0,0,0,1)'
    document.body.prepend(el)
    return el
}

class Fireworks {
    //#region DEFINE
    // number
    quantity = 20
    // angle
    range = 30
    // number
    speed = 12
    // angle
    angle = 45
    // dots
    position = [0, 0]
    // arr
    colors = ["#999999", "#CCCCCC"]
    // enum {range, value}
    colorsMode = 'range'
    // enum {firework, parabola}
    launchMode = 'parabola'
    // object eg.
    // {"arc":range, "ratio":num}
    // {"rect":[width, height], "ratio":num}
    // {"text":[text, size], "ratio":num}
    shape = [
        { "arc": 20, "ratio": 1 },
        { "rect": [20, 40], "ratio": 1 },
        { "text": ["Firework", 20], "ratio": 1 }
    ]
    // num
    gravity = 9.8
    // transform
    isTransform = true

    // object
    #spirits = []
    #spiritsDustbin = []
    //#endregion

    //#region INIT
    #newSpirits() {
        // recalculate ratio
        var totalratio = 0
        for (var i in this.shape) {
            totalratio += this.shape[i].ratio
        }
        for (var i in this.shape) {
            this.shape[i].ratio = parseInt(
                (this.shape[i].ratio * this.quantity) / totalratio)
        }
        // new spirit
        var spirit = []
        for (var i in this.shape) {
            var items = JSON.parse(JSON.stringify(this.shape[i]))
            for (var ii = 0; ii < items.ratio; ++ii) {
                var iitem = JSON.parse(JSON.stringify(items))
                // Init position and direction
                iitem.x = this.position[0]
                iitem.y = this.position[1]
                // Init color
                if (this.colorsMode == 'value') {
                    iitem.color = this.colors[
                        parseInt(
                            Math.random() * this.colors.length
                        )]
                } else if (this.colorsMode == 'range') {
                    iitem.color = this.#getColor()
                }
                // Init angle and speed
                iitem.angle = this.angle
                    + Math.random() * (this.range / 2)
                    * (Math.random() > 0.5 ? 1 : -1)
                iitem.speed = this.speed
                    + Math.random() * this.speed
                    * (this.launchMode == 'firework' ? 2 : 0.5)
                // Init Greaity
                if (this.launchMode == 'firework') {
                    iitem.gravity = this.gravity
                        + Math.random()
                }
                // Calculation vertical and horizontal velocity
                iitem.verticalV = Math.sin(iitem.angle * PIR) * iitem.speed
                iitem.horizontalV = Math.cos(iitem.angle * PIR) * iitem.speed
                // Init transformation
                iitem.transformation = [1, 0, 0, 1, 0, 0]
                spirit.push(iitem)
            }
        }
        this.#spirits.push([Date.now(), spirit, 0])
    }

    #getColor() {
        var groupL = parseInt(this.colors.length / 2)
        var group = parseInt(Math.random() * groupL)
        var hcolor = this.colors[group * 2].slice(1)
        var ecolor = this.colors[group * 2 + 1].slice(1)
        try {
            var hcolorR = parseInt(hcolor.slice(0, 2), 16)
            var hcolorG = parseInt(hcolor.slice(2, 4), 16)
            var hcolorB = parseInt(hcolor.slice(4, 6), 16)
            var ecolorR = parseInt(ecolor.slice(0, 2), 16)
            var ecolorG = parseInt(ecolor.slice(2, 4), 16)
            var ecolorB = parseInt(ecolor.slice(4, 6), 16)
        } catch (m) {
            throw new TypeError('Color must be #xxxxxx')
        }

        var colorR = parseInt(
            Math.random() *
            Math.abs(ecolorR - hcolorR) +
            (hcolorR < ecolorR ? hcolorR : ecolorR)
        ).toString(16)
        if (colorR.length == 1) colorR = '0' + colorR

        var colorG = parseInt(
            Math.random() *
            Math.abs(ecolorG - hcolorG) +
            (hcolorG < ecolorG ? hcolorG : ecolorG)
        ).toString(16)
        if (colorG.length == 1) colorG = '0' + colorG

        var colorB = parseInt(
            Math.random() *
            Math.abs(ecolorB - hcolorB) +
            (hcolorB < ecolorB ? hcolorB : ecolorB)
        ).toString(16)
        if (colorB.length == 1) colorB = '0' + colorB

        return '#' + colorR + colorG + colorB
    }
    //#endregion

    //#region DRAW
    #draw() {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        for (var g in this.#spirits) {
            for (var i in this.#spirits[g][1]) {
                var item = this.#spirits[g][1][i]
                switch (Object.keys(item)[0]) {
                    case 'arc':
                        this.#drawArc(item)
                        break
                    case 'rect':
                        this.#drawRect(item)
                        break
                    case 'text':
                        this.#drawText(item)
                        break;
                }
            }
        }
    }

    #drawArc(spirit) {
        this.ctx.beginPath()
        this.ctx.save()
        this.#transform(spirit)
        this.ctx.arc(
            spirit.x - spirit.y * spirit.transformation[2],
            spirit.y - spirit.x * spirit.transformation[1],
            spirit.arc,
            0, PIPI
        )
        this.ctx.fillStyle = spirit.color
        this.ctx.fill()
        this.ctx.strokeStyle = spirit.color
        this.ctx.stroke()
        this.ctx.closePath()
        this.ctx.restore()
    }
    #drawRect(spirit) {
        this.ctx.save()
        this.#transform(spirit)
        this.ctx.fillStyle = spirit.color
        this.ctx.fillRect(
            spirit.x - spirit.y * spirit.transformation[2],
            spirit.y - spirit.x * spirit.transformation[1],
            spirit.rect[0], spirit.rect[1]
        )
        this.ctx.strokeStyle = spirit.color
        this.ctx.stroke()
        this.ctx.restore()
    }
    #drawText(spirit) {
        this.ctx.save()
        this.ctx.font = spirit.text[1] + 'px sans-serif'
        this.ctx.fillStyle = spirit.color
        this.#transform(spirit)
        this.ctx.fillText(
            spirit.text[0],
            spirit.x - spirit.y * spirit.transformation[2],
            spirit.y - spirit.x * spirit.transformation[1]
        )
        this.ctx.strokeStyle = spirit.color
        this.ctx.stroke()
        this.ctx.restore()
    }
    #transform(spirit) {
        var offsetX = spirit.x - spirit.x * spirit.transformation[0]
        var offsetY = spirit.y - spirit.y * spirit.transformation[3]
        switch (Object.keys(spirit)[0]) {
            case 'rect':
                offsetX -= spirit.rect[1] * spirit.transformation[2]
                offsetY -= spirit.rect[1] * spirit.transformation[1]
                break
            case 'arc':
                offsetX -= spirit.arc * spirit.transformation[2] * 2
                offsetY -= spirit.arc * spirit.transformation[1] * 2
                break
            case 'text':
                offsetX -= spirit.text[1] * spirit.transformation[2]
                offsetY -= spirit.text[1] * spirit.transformation[1]
        }
        this.ctx.setTransform()
        this.ctx.transform(spirit.transformation[0],
            spirit.transformation[1],
            spirit.transformation[2],
            spirit.transformation[3],
            spirit.transformation[4] + offsetX,
            spirit.transformation[5] + offsetY)
    }
    //#endregion

    //#region ENGINE
    #moveEngine() {
        for (var g in this.#spirits) {
            var msec = (Date.now() - this.#spirits[g][0])
            var time = msec / 1000
            var spiritDustbin = []
            for (var i in this.#spirits[g][1]) {
                var item = this.#spirits[g][1][i]
                var verticalS, horizontalS

                switch (this.launchMode) {
                    case 'parabola':
                        verticalS = item.verticalV * time
                            - 0.5 * (this.gravity)
                            * Math.pow(time, 2)
                        horizontalS = item.horizontalV * time * 0.1
                        break
                    case 'firework':
                        if (time < 0.1) {
                            verticalS = item.verticalV * time * 64
                            horizontalS = item.horizontalV * time * 64
                        }
                        else {
                            horizontalS = 0
                            verticalS = item.gravity * time * -1
                        }
                        break
                }
                item.x += horizontalS
                item.y -= verticalS

                var topPosition = 0
                switch (Object.keys(item)[0]) {
                    case 'arc':
                        topPosition = item.y - item.arc
                        break
                    case 'rect':
                        topPosition = item.y - item.rect[1]
                        break
                    case 'text':
                        topPosition = item.y - item.text[1] * PIPI
                        break
                }
                if (topPosition > window.innerHeight) {
                    spiritDustbin.push(i)
                }
            }
            this.#spiritsDustbin.push([g, spiritDustbin])
        }
    }
    #transformEngine() {
        if (!this.isTransform)
            return

        for (var g in this.#spirits) {
            var msec = (Date.now() - this.#spirits[g][0])
            var time = msec / 1000
            if (time - this.#spirits[g][2] < 0.1)
                continue

            for (var i in this.#spirits[g][1]) {
                var item = this.#spirits[g][1][i]

                if (!('polarity' in item)) {
                    if (Math.random() > 0.2)
                        continue
                    item.polarity = false
                }

                var c = item.transformation[2]
                var d = item.transformation[3]
                c *= 10
                d *= 10
                c -= 2
                if (c < -20) {
                    c = 18
                }
                d += (item.polarity ? 1 : -1)
                if (d <= 0) {
                    item.polarity = true
                    d = 0
                }
                else if (d >= 10) {
                    item.polarity = false
                    d = 10
                }

                item.transformation[2] = c / 10
                item.transformation[3] = d / 10
            }
            this.#spirits[g][2] = time
        }
    }
    #clearDustbin() {
        for (var g in this.#spiritsDustbin) {
            var group = this.#spiritsDustbin[g][0]
            var dustbin = this.#spiritsDustbin[g][1]
            for (var i in dustbin) {
                this.#spirits[group][1]
                    .splice(dustbin[i] - i, 1)
            }
        }
        this.#spiritsDustbin.splice(0, this.#spiritsDustbin.length)
        var spiritL = this.#spirits.length
        for (var i = 0; i < spiritL; ++i) {
            if (this.#spirits[i][1].length == 0) {
                this.#spirits.splice(i, 1)
                i--
                spiritL--
            }
        }
    }
    //#endregion

    constructor() {
        this.el = addCanvas()
        this.ctx = this.el.getContext("2d")
    }

    launch() {
        const self = this
        this.#newSpirits()
        var procedure = function () {
            self.#moveEngine()
            self.#transformEngine()
            self.#draw()
            self.#clearDustbin()
            if (self.#spirits.length > 0)
                requestAnimationFrame(procedure)
        }
        procedure()
    }
}

export default {
    Fireworks,
}
