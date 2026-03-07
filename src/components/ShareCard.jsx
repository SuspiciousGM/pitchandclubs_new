import { GOLF_BG } from '../assets/golf-bg';

// ── Helpers ──────────────────────────────────────
const diffColor = (d) => {
  if (d <= -2) return "#FBBF24";
  if (d === -1) return "#60A5FA";
  if (d === 0)  return "#CAFF4D";
  if (d === 1)  return "#d4d4d4";
  return "#EF4444";
};
const fmtDiff = (d) => d === 0 ? "E" : d > 0 ? "+" + d : "" + d;
const getStats = (scores, pars) => ({
  hio:     scores.filter((v) => v === 1).length,
  birdies: scores.filter((v, i) => v - pars[i] === -1).length,
  pars:    scores.filter((v, i) => v - pars[i] === 0).length,
  bogeys:  scores.filter((v, i) => v - pars[i] === 1).length,
});

function Dot({ v, par, size }) {
  const sz = size || 19;
  const d = v - par;
  const col = diffColor(d);
  const base = { width:sz, height:sz, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 };
  const lbl = <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:sz*0.72, color:col, lineHeight:1 }}>{v}</span>;
  if (v === 1)  return <div style={{ ...base, borderRadius:"50%", border:"1.5px solid #FBBF24" }}>{lbl}</div>;
  if (d <= -1)  return <div style={{ ...base, borderRadius:"50%", border:"1.5px solid " + col }}>{lbl}</div>;
  if (d === 0)  return <div style={base}>{lbl}</div>;
  return <div style={{ ...base, borderRadius:Math.round(sz*0.18), border:"1.5px solid " + col }}>{lbl}</div>;
}

function TopBar({ date }) {
  return (
    <div style={{
      position:"absolute", top:0, left:0, right:0, zIndex:5,
      padding:"12px 18px", display:"flex", justifyContent:"space-between", alignItems:"center",
      background:"linear-gradient(180deg,rgba(0,0,0,.65) 0%,transparent 100%)",
    }}>
      <svg width="80" height="64" viewBox="0 0 1372 1100" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ filter:"drop-shadow(0 2px 8px rgba(0,0,0,.8))", flexShrink:0 }}>
        <path d="M504.231 452.22C567.525 452.22 598.597 487.319 598.597 551.764V604.125C598.597 668.57 567.525 703.67 504.231 703.67H474.31V855H411.016V452.22H504.231ZM504.231 509.76H474.31V646.13H504.231C524.37 646.13 535.302 636.923 535.302 608.153V547.736C535.302 518.966 524.37 509.76 504.231 509.76Z" fill="white"/>
        <path d="M931.727 704.821H991.569V758.333C991.569 822.778 959.346 859.603 897.203 859.603C835.06 859.603 802.837 822.778 802.837 758.333V548.887C802.837 484.442 835.06 447.617 897.203 447.617C959.346 447.617 991.569 484.442 991.569 548.887V588.014H931.727V544.859C931.727 516.089 919.068 505.157 898.929 505.157C878.79 505.157 866.131 516.089 866.131 544.859V762.361C866.131 791.131 878.79 801.488 898.929 801.488C919.068 801.488 931.727 791.131 931.727 762.361V704.821Z" fill="white"/>
        <mask id="path-3-outside-1_85_10" maskUnits="userSpaceOnUse" x="558" y="417" width="340" height="474" fill="black">
          <rect fill="white" x="558" y="417" width="340" height="474"/>
          <path d="M682.08 446.997C737.821 446.997 767.703 479.753 767.703 534.344V537.218C767.703 575.145 752.762 599.855 705.64 646.976L747.015 711.337H748.165V652.148L801.032 655.021V721.106C801.032 744.092 798.734 764.205 791.838 780.87L841.258 855H768.852L757.359 836.611C740.119 853.276 717.133 860.747 688.401 860.747C627.488 860.747 588.411 826.267 588.411 762.481V748.115C588.411 711.912 599.904 680.881 632.66 643.528C605.076 597.556 596.457 571.122 596.457 539.516V536.068C596.457 478.029 626.338 446.997 682.08 446.997ZM682.654 503.313C665.415 503.313 655.071 514.806 655.071 537.218V540.091C655.071 556.181 660.243 572.271 675.184 601.004H676.333C702.192 572.271 710.238 557.905 710.238 538.942V536.068C710.238 515.381 700.468 503.313 682.654 503.313ZM665.989 693.523H664.84C653.347 714.785 649.324 729.726 649.324 747.54V756.735C649.324 790.064 666.564 804.431 691.274 804.431C705.64 804.431 717.708 799.833 726.902 790.064L665.989 693.523Z"/>
        </mask>
        <path d="M682.08 446.997C737.821 446.997 767.703 479.753 767.703 534.344V537.218C767.703 575.145 752.762 599.855 705.64 646.976L747.015 711.337H748.165V652.148L801.032 655.021V721.106C801.032 744.092 798.734 764.205 791.838 780.87L841.258 855H768.852L757.359 836.611C740.119 853.276 717.133 860.747 688.401 860.747C627.488 860.747 588.411 826.267 588.411 762.481V748.115C588.411 711.912 599.904 680.881 632.66 643.528C605.076 597.556 596.457 571.122 596.457 539.516V536.068C596.457 478.029 626.338 446.997 682.08 446.997ZM682.654 503.313C665.415 503.313 655.071 514.806 655.071 537.218V540.091C655.071 556.181 660.243 572.271 675.184 601.004H676.333C702.192 572.271 710.238 557.905 710.238 538.942V536.068C710.238 515.381 700.468 503.313 682.654 503.313ZM665.989 693.523H664.84C653.347 714.785 649.324 729.726 649.324 747.54V756.735C649.324 790.064 666.564 804.431 691.274 804.431C705.64 804.431 717.708 799.833 726.902 790.064L665.989 693.523Z" fill="#CAFF4D"/>
        <path d="M705.64 646.976L684.49 625.826L667.444 642.872L680.48 663.15L705.64 646.976ZM747.015 711.337L721.855 727.511L730.686 741.247H747.015V711.337ZM748.165 711.337V741.247H778.075V711.337H748.165ZM748.165 652.148L749.788 622.282L718.254 620.568V652.148H748.165ZM801.032 655.021H830.943V626.692L802.656 625.155L801.032 655.021ZM791.838 780.87L764.2 769.434L758.098 784.181L766.951 797.461L791.838 780.87ZM841.258 855V884.91H897.146L866.145 838.409L841.258 855ZM768.852 855L743.488 870.852L752.274 884.91H768.852V855ZM757.359 836.611L782.723 820.759L763.138 789.424L736.571 815.106L757.359 836.611ZM632.66 643.528L655.148 663.249L669.532 646.846L658.308 628.139L632.66 643.528ZM675.184 601.004L648.647 614.803L657.025 630.914H675.184V601.004ZM676.333 601.004V630.914H689.654L698.565 621.013L676.333 601.004ZM665.989 693.523L691.285 677.562L682.484 663.613H665.989V693.523ZM664.84 693.523V663.613H647.007L638.528 679.3L664.84 693.523ZM726.902 790.064L748.683 810.564L764.56 793.695L752.198 774.104L726.902 790.064ZM682.08 446.997V476.908C704.068 476.908 716.828 483.229 724.236 490.932C731.822 498.821 737.792 512.318 737.792 534.344H767.703H797.613C797.613 501.779 788.642 471.603 767.352 449.466C745.884 427.143 715.833 417.087 682.08 417.087V446.997ZM767.703 534.344H737.792V537.218H767.703H797.613V534.344H767.703ZM767.703 537.218H737.792C737.792 551.41 735.209 561.871 728.386 573.785C720.851 586.944 707.749 602.567 684.49 625.826L705.64 646.976L726.79 668.126C750.653 644.264 768.582 623.971 780.298 603.513C792.726 581.809 797.613 560.953 797.613 537.218H767.703ZM705.64 646.976L680.48 663.15L721.855 727.511L747.015 711.337L772.175 695.163L730.8 630.802L705.64 646.976ZM747.015 711.337V741.247H748.165V711.337V681.427H747.015V711.337ZM748.165 711.337H778.075V652.148H748.165H718.254V711.337H748.165ZM748.165 652.148L746.541 682.014L799.409 684.888L801.032 655.021L802.656 625.155L749.788 622.282L748.165 652.148ZM801.032 655.021H771.122V721.106H801.032H830.943V655.021H801.032ZM801.032 721.106H771.122C771.122 742.623 768.879 758.127 764.2 769.434L791.838 780.87L819.476 792.306C828.589 770.283 830.943 745.562 830.943 721.106H801.032ZM791.838 780.87L766.951 797.461L816.371 871.591L841.258 855L866.145 838.409L816.725 764.279L791.838 780.87ZM841.258 855V825.09H768.852V855V884.91H841.258V855ZM768.852 855L794.216 839.148L782.723 820.759L757.359 836.611L731.995 852.464L743.488 870.852L768.852 855ZM757.359 836.611L736.571 815.106C726.443 824.896 711.811 830.836 688.401 830.836V860.747V890.657C722.456 890.657 753.796 881.656 778.147 858.116L757.359 836.611ZM688.401 860.747V830.836C663.445 830.836 646.63 823.838 636.216 813.898C626.019 804.164 618.322 788.146 618.322 762.481H588.411H558.501C558.501 800.603 570.342 833.717 594.911 857.17C619.264 880.415 652.443 890.657 688.401 890.657V860.747ZM588.411 762.481H618.322V748.115H588.411H558.501V762.481H588.411ZM588.411 748.115H618.322C618.322 720.396 626.3 696.145 655.148 663.249L632.66 643.528L610.171 623.808C573.508 665.616 558.501 703.428 558.501 748.115H588.411ZM632.66 643.528L658.308 628.139C632.079 584.425 626.367 563.464 626.367 539.516H596.457H566.546C566.546 578.78 578.074 610.688 607.012 658.917L632.66 643.528ZM596.457 539.516H626.367V536.068H596.457H566.546V539.516H596.457ZM596.457 536.068H626.367C626.367 511.878 632.565 498.153 639.924 490.501C647.097 483.042 659.656 476.908 682.08 476.908V446.997V417.087C648.762 417.087 618.509 426.468 596.807 449.035C575.289 471.409 566.546 502.219 566.546 536.068H596.457ZM682.654 503.313V473.403C666.97 473.403 650.928 478.938 639.444 492.685C628.646 505.61 625.161 521.904 625.161 537.218H655.071H684.981C684.981 533.847 685.378 531.84 685.66 530.875C685.927 529.964 686.007 530.254 685.352 531.038C684.629 531.903 683.629 532.626 682.669 533.03C681.818 533.388 681.655 533.224 682.654 533.224V503.313ZM655.071 537.218H625.161V540.091H655.071H684.981V537.218H655.071ZM655.071 540.091H625.161C625.161 563.66 633.189 585.076 648.647 614.803L675.184 601.004L701.721 587.205C687.297 559.467 684.981 548.703 684.981 540.091H655.071ZM675.184 601.004V630.914H676.333V601.004V571.094H675.184V601.004ZM676.333 601.004L698.565 621.013C724.822 591.839 740.148 570.046 740.148 538.942H710.238H680.327C680.327 545.764 679.563 552.704 654.101 580.995L676.333 601.004ZM710.238 538.942H740.148V536.068H710.238H680.327V538.942H710.238ZM710.238 536.068H740.148C740.148 521.481 736.746 505.555 726.104 492.785C714.777 479.192 698.793 473.403 682.654 473.403V503.313V533.224C683.735 533.224 683.61 533.402 682.776 533.048C682.367 532.874 681.881 532.61 681.381 532.238C680.88 531.866 680.466 531.462 680.148 531.081C679.498 530.301 679.531 529.964 679.749 530.701C679.98 531.484 680.327 533.188 680.327 536.068H710.238ZM665.989 693.523V663.613H664.84V693.523V723.433H665.989V693.523ZM664.84 693.523L638.528 679.3C625.258 703.849 619.414 723.66 619.414 747.54H649.324H679.235C679.235 735.792 681.436 725.721 691.152 707.746L664.84 693.523ZM649.324 747.54H619.414V756.735H649.324H679.235V747.54H649.324ZM649.324 756.735H619.414C619.414 778.296 625.028 798.667 639.388 813.724C653.918 828.959 673.178 834.341 691.274 834.341V804.431V774.52C684.66 774.52 682.946 772.719 682.678 772.438C682.241 771.98 679.235 768.503 679.235 756.735H649.324ZM691.274 804.431V834.341C712.566 834.341 732.99 827.237 748.683 810.564L726.902 790.064L705.122 769.565C702.426 772.429 698.715 774.52 691.274 774.52V804.431ZM726.902 790.064L752.198 774.104L691.285 677.562L665.989 693.523L640.693 709.484L701.606 806.025L726.902 790.064Z" fill="#111214" mask="url(#path-3-outside-1_85_10)"/>
        <path d="M596.755 413.567C599.741 414.634 599.742 418.857 596.756 419.925L406.805 487.828C404.606 488.614 402.293 486.984 402.293 484.65L402.277 348.896C402.277 346.561 404.59 344.931 406.788 345.716L596.755 413.567Z" fill="#CAFF4D" stroke="#111214" strokeWidth="16.8796"/>
        <path d="M363.114 861.871C386.235 861.871 407.466 864.363 423.173 868.554C430.964 870.634 437.878 873.256 443.043 876.514C447.787 879.508 453.412 884.581 453.412 892.155C453.412 899.729 447.787 904.802 443.043 907.796C437.878 911.054 430.964 913.677 423.173 915.757C407.466 919.948 386.235 922.44 363.114 922.44C339.993 922.44 318.763 919.948 303.056 915.757C295.264 913.677 288.351 911.054 283.186 907.796C278.441 904.802 272.816 899.729 272.816 892.155C272.816 884.581 278.441 879.508 283.186 876.514C288.351 873.256 295.264 870.634 303.056 868.554C318.763 864.363 339.993 861.871 363.114 861.871Z" fill="white" stroke="#111214" strokeWidth="16.8796"/>
        <rect x="342.429" y="328.953" width="41.8451" height="565.641" rx="19.4116" fill="white" stroke="#111214" strokeWidth="16.8796"/>
      </svg>
      <div style={{ textAlign:"right" }}>
        <div style={{ fontSize:8, color:"rgba(202,255,77,.88)", fontFamily:"system-ui", fontWeight:700, letterSpacing:".12em" }}>PITCHANDCLUBS.CAT</div>
        <div style={{ fontSize:7, color:"rgba(255,255,255,.4)", fontFamily:"system-ui", fontWeight:600, letterSpacing:".08em", marginTop:1 }}>{date}</div>
      </div>
    </div>
  );
}

function Card1P({ player, course, date }) {
  const dc = diffColor(player.diff);
  const st = getStats(player.scores, player.pars);
  return (
    <div style={{
      width:270, height:480, borderRadius:20, overflow:"hidden", position:"relative",
      flexShrink:0, fontFamily:"'Bebas Neue',cursive",
      boxShadow:"0 32px 80px rgba(0,0,0,.95)",
    }}>
      <img src={GOLF_BG} alt="" style={{
        position:"absolute", inset:0, width:"100%", height:"100%",
        objectFit:"cover", objectPosition:"58% 50%",
      }}/>
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.04) 26%,rgba(4,8,3,.6) 48%,rgba(4,8,3,.96) 64%,rgba(4,8,3,1) 75%)",
      }}/>
      <TopBar date={date} />

      <div style={{ position:"absolute", top:"28%", left:20, zIndex:5 }}>
        <div style={{
          fontSize:92, color:dc, lineHeight:.85, letterSpacing:"-.03em",
          textShadow:"0 4px 28px rgba(0,0,0,1)",
        }}>{fmtDiff(player.diff)}</div>
        <div style={{ fontSize:8, color:"rgba(255,255,255,.35)", fontFamily:"system-ui", fontWeight:700, letterSpacing:".14em", marginTop:6 }}>
          SOTA EL PAR - PAR 54
        </div>
      </div>

      <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:5, padding:"0 20px 18px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div>
            <div style={{ fontSize:16, color:"rgba(255,255,255,.9)", letterSpacing:".04em", lineHeight:1 }}>{player.name.toUpperCase()}</div>
            <div style={{ fontSize:8, color:"rgba(255,255,255,.22)", fontFamily:"system-ui", fontWeight:600, letterSpacing:".08em", marginTop:2 }}>{course}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:16, color:"rgba(255,255,255,.28)", lineHeight:1 }}>{player.pts}</div>
            <div style={{ fontSize:6, color:"rgba(255,255,255,.14)", fontFamily:"system-ui", fontWeight:700, letterSpacing:".1em", marginTop:1 }}>P&amp;C PTS</div>
          </div>
        </div>
        <div style={{ height:1, background:"linear-gradient(90deg,rgba(202,255,77,.4),transparent)", marginBottom:10 }}/>
        <div style={{ fontSize:7, color:"rgba(255,255,255,.16)", fontFamily:"system-ui", fontWeight:700, letterSpacing:".18em", marginBottom:7 }}>TARGETA VIRTUAL</div>
        {[0,1].map((row) => (
          <div key={row} style={{ display:"flex", gap:2, marginBottom:4, justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:7, color:"rgba(202,255,77,.3)", fontFamily:"system-ui", fontWeight:700, width:26, flexShrink:0 }}>
              {row === 0 ? "F1-9" : "F10-18"}
            </div>
            {player.scores.slice(row*9, row*9+9).map((v, i) => (
              <Dot key={i} v={v} par={player.pars[row*9+i]} size={19} />
            ))}
          </div>
        ))}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:5, marginTop:9 }}>
          {[["H.i.1",st.hio,"#FBBF24"],["Birdies",st.birdies,"#60A5FA"],["Pars",st.pars,"rgba(255,255,255,.4)"],["Bogeys",st.bogeys,"rgba(255,255,255,.2)"]].map(([l,v,c]) => (
            <div key={l} style={{ background:"rgba(0,0,0,.4)", border:"1px solid rgba(255,255,255,.07)", borderRadius:8, padding:"6px 4px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:16, color:c, lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:6, color:"rgba(255,255,255,.2)", fontFamily:"system-ui", fontWeight:700, letterSpacing:".07em", marginTop:2, lineHeight:1.2 }}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardMultiP({ players, course, date }) {
  const sorted = [...players].map((p, i) => ({ ...p, origIdx:i })).sort((a, b) => a.diff - b.diff);
  const dotSz   = players.length <= 2 ? 15 : players.length === 3 ? 13 : 11;
  const scoreSz = players.length <= 2 ? 26 : players.length === 3 ? 22 : 18;
  const topOffset = players.length <= 2 ? 210 : players.length === 3 ? 165 : 138;

  return (
    <div style={{
      width:270, height:480, borderRadius:20, overflow:"hidden", position:"relative",
      flexShrink:0, fontFamily:"'Bebas Neue',cursive",
      boxShadow:"0 32px 80px rgba(0,0,0,.95)",
    }}>
      <img src={GOLF_BG} alt="" style={{
        position:"absolute", inset:0, width:"100%", height:"100%",
        objectFit:"cover", objectPosition:"58% 50%",
      }}/>
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(180deg,rgba(0,0,0,.1) 0%,rgba(0,0,0,.08) 15%,rgba(4,8,3,.72) 32%,rgba(4,8,3,.98) 46%,rgba(4,8,3,1) 56%)",
      }}/>
      <TopBar date={date} />

      <div style={{ position:"absolute", top:54, left:20, right:20, zIndex:5 }}>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <div style={{ fontSize:7, color:"rgba(255,255,255,.18)", fontFamily:"system-ui", fontWeight:700, letterSpacing:".2em" }}>CLASSIFICACIO FINAL</div>
          <div style={{ fontSize:7, color:"rgba(255,255,255,.18)", fontFamily:"system-ui", fontWeight:600 }}>{course}</div>
        </div>
      </div>

      <div style={{
        position:"absolute", top:topOffset, left:0, right:0, bottom:0,
        zIndex:5, padding:"0 14px 14px",
        display:"flex", flexDirection:"column", justifyContent:"flex-end", gap:5,
      }}>
        {sorted.map((pl, rank) => {
          const dc = diffColor(pl.diff);
          const isFirst = rank === 0;
          return (
            <div key={pl.name} style={{
              background: isFirst ? "rgba(202,255,77,.07)" : "rgba(0,0,0,.45)",
              border: "1px solid " + (isFirst ? "rgba(202,255,77,.2)" : "rgba(255,255,255,.06)"),
              borderRadius:10, padding:"7px 9px",
              backdropFilter:"blur(8px)", flexShrink:0,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                <div style={{
                  width:17, height:17, borderRadius:"50%", flexShrink:0,
                  background: isFirst ? "rgba(202,255,77,.15)" : "rgba(255,255,255,.05)",
                  border: "1px solid " + (isFirst ? "rgba(202,255,77,.4)" : "rgba(255,255,255,.1)"),
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <span style={{ fontSize:9, color: isFirst ? "#CAFF4D" : "rgba(255,255,255,.3)", fontFamily:"system-ui", fontWeight:800 }}>{rank+1}</span>
                </div>
                <div style={{ flex:1, fontSize:11, color: isFirst ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.7)", letterSpacing:".04em", lineHeight:1 }}>
                  {pl.name.toUpperCase()}
                </div>
                <div style={{ fontSize:scoreSz, color:dc, lineHeight:1 }}>
                  {fmtDiff(pl.diff)}
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,.22)", lineHeight:1 }}>{pl.pts}</div>
                  <div style={{ fontSize:5, color:"rgba(255,255,255,.12)", fontFamily:"system-ui", fontWeight:700, letterSpacing:".08em", marginTop:1 }}>PTS</div>
                </div>
              </div>
              {[0,1].map((row) => (
                <div key={row} style={{ display:"flex", gap:1.5, marginBottom:row===0?2:0, justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:5.5, color:"rgba(202,255,77,.25)", fontFamily:"system-ui", fontWeight:700, width:18, flexShrink:0 }}>
                    {row === 0 ? "F1" : "F10"}
                  </div>
                  {pl.scores.slice(row*9, row*9+9).map((v, i) => (
                    <Dot key={i} v={v} par={pl.pars[row*9+i]} size={dotSz} />
                  ))}
                </div>
              ))}
            </div>
          );
        })}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
          <div style={{ fontSize:7, color:"rgba(255,255,255,.12)", fontFamily:"system-ui", fontWeight:700, letterSpacing:".12em" }}>TARGETA VIRTUAL</div>
          <div style={{ fontSize:7, color:"rgba(255,255,255,.12)", fontFamily:"system-ui", fontWeight:600 }}>{date}</div>
        </div>
      </div>
    </div>
  );
}

export function ShareCard({ game }) {
  const players = game.players || [];
  if (players.length === 1) {
    return <Card1P player={players[0]} course={game.course} date={game.date} />;
  }
  return <CardMultiP players={players} course={game.course} date={game.date} />;
}
