
import InsertChartIcon from '@mui/icons-material/InsertChart';
import SupportIcon from '@mui/icons-material/Support';
import SearchIcon from '@mui/icons-material/Search';
import MediationIcon from '@mui/icons-material/Mediation';
import GitHubIcon from '@mui/icons-material/GitHub';

const FAQ: React.FC = () => {
    return (
        <>
            <main className='container flex flex-col w-full m-28 mx-auto px-24 pt-14'>
                <div className="w-full">
                    <h1 className='text-4xl font-bold text-left pb-10 animate-fadeIn'>About</h1>
                    <div className='animate-fadeInSlow'>
                        <p>
                            As part of its commitment  to help equip decision makers and the public with the information they need to navigate the complex water sector, the Texas Water Foundation, in partnership with the Institute for Homeland Security at Sam Houston State University, has developed a this site to improve water data analysis.
                        </p>
                        <p className="pt-4">
                            The Texas Water Network Explorer (TWNet) uses network analysis and visualization to simplify complex water data, helping highlight the sector’s central role in Texas’ Critical Infrastructure. This tool maps interactions among water entities across Texas, illustrating how water is acquired, sold, and redistributed.
                        </p>
                        <p className="pt-4">
                            Users can find value through:
                        </p>
                        <ul className="pl-8 pt-4">
                            <li><InsertChartIcon fontSize="small" className='mr-2' /><b>Intuitive Visual Statistics:</b> Visualize and interpret complex relationships between water entities, identifying source intakes, sales, and retail distribution.</li>
                            <li><SupportIcon fontSize="small" className='mr-2' /><b>Data-Driven Decision Support:</b> Enhanced insights support informed decision-making in areas like system resilience, risk management, infrastructure planning, and the development of water use policies.</li>
                            <li><SearchIcon fontSize='small' className='mr-2' /><b>Network Dependencies Identification:</b> Pinpoint dependencies and vulnerable connections within the water network to mitigate risks.</li>
                            <li><MediationIcon fontSize='small' className='mr-2' /><b>Water Movement:</b> Visualization Track water flow through the system for better understanding</li>
                        </ul>
                    </div>

                </div>
                <div className="w-full mt-10">
                    <h1 className='text-4xl font-bold text-left pt-10 pb-10 animate-fadeIn'>Sponsorship</h1>
                    <div className='animate-fadeInSlow'>
                        <p>
                            This Web site was co-developed between Sam Houston State University's <a href='https://ihsonline.org/' target='_blank' className='aPlus'>Institute for Homeland Security</a> and the <a href="https://www.texaswater.org/" target='_blank' className='aPlus'>Texas Water Foundation</a>.
                        </p>
                    </div>
                </div>
                {/* <div className="w-full mt-10">
                    <h1 className='text-4xl font-bold text-left pt-10 pb-10 animate-fadeIn'>Reproducibility</h1>
                    <div className='animate-fadeInSlow'>
                        <p>
                            This Web site and the analysis reflected herein were developed using open-source software. All code is version controlled using <a href='https://github.com/cllghn/shsu-twn' target='_blank' className='aPlus'> <GitHubIcon /> GitHub and can be accessed here.</a>
                        </p>
                    </div>
                </div> */}


            </ main>
        </>
    );
}

export default FAQ;