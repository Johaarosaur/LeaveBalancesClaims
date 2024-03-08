import * as React from 'react';
import styles from './LeaveBalancesAndClaims.module.scss';
import { ILeaveBalancesAndClaimsProps } from './ILeaveBalancesAndClaimsProps';
/*import { escape } from '@microsoft/sp-lodash-subset';*/

export interface ILeaveBalance {

  leaveDescription: string;
  availableBalance: string;
}

interface ILeaveBalancesAndClaimsState {
  leaveDescription: string;
  availableBalance: string;
  authenticateKey: string;
}

export default class LeaveBalancesAndClaims extends React.Component<ILeaveBalancesAndClaimsProps,ILeaveBalancesAndClaimsState, ILeaveBalance> {
  constructor(props: ILeaveBalancesAndClaimsProps) {
    super(props);
    this.state = {
      authenticateKey: "",
      leaveDescription: "",
      availableBalance: ""

    };
  }

async componentDidMount(): Promise<void> {
  try{
    await this.authenticate();

  } catch (error){
    console.error("Error:",error);
  }
}

authenticate=async(): Promise<void> => {
  const baseURL = `https://eohapi.educos.co.za`;
  const GID = "10003864";
  const authEndpoint = `${baseURL}/auth/${GID}`;
  const authUser = 'SharepAPI';
  const authKey = 'E6DA5F46B97C059E2E9200EAE71E23FE4FCC52888F96847B42DD65819FE536A1';

  try {
    const base64Auth = btoa(`${authUser}:${authKey}`);
    const requestOptions: RequestInit = {
      method: 'GET', 
      headers: {
      'Authorization': `Basic ${base64Auth}`,
     },
    };
    const response = await fetch(authEndpoint, requestOptions);

    if (response.ok){
      const data = await response.json();

      if (data){ 
        const authKey = data.key;
      

        this.setState({
          authenticateKey: authKey, 
        });
        console.log('authKey:', this.state.authenticateKey)
      } else{
        console.error('Error: invalid data');
      }
    } else{
      throw new Error('Error:'+ response.statusText);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}


  // public async componentDidMount() {
  //   try {
  //     // Authentication logic
  //     const authorizationKey = await this.authenticate();

  //     // API call for leave balance data
  //     const leaveBalanceData = await this.getLeaveBalance(authorizationKey);
  //     console.log('Leave Balance Data:', leaveBalanceData);

  //     // Update state with the number of annual leave days
  //     const annualLeave = leaveBalanceData.find((item: any) => item.LeaveDescription === 'Annual');
  //     if (annualLeave) {
  //       this.setState({ annualLeaveDays: parseFloat(annualLeave.AvailBal) });
  //     }
  //   } catch (error) {
  //     console.error('Error:', error.message);
  //   }
  // }

  //  private async authenticate() {
    
  //   const base64Auth = btoa(`${this.authUser}:${this.authKey}`);

  //   const authRequestOptions = {
  //     method: 'GET',
  //     headers: {
  //       'Authorization': `Basic ${base64Auth}`,
  //     },
  //   };

  //   try {
  //     const authResponse = await fetch(this.authEndpoint, authRequestOptions);
  //     if (!authResponse.ok) {
  //       throw new Error('Authentication failed');
  //     }

  //     const authData = await authResponse.json();
  //     return authData.key;
  //   } catch (error) {
  //     console.error('Authentication Error:', error.message);
  //     throw error;
  //   }
  // }

  // private async getLeaveBalance(authorizationKey: string) {
  //   const leaveBalanceRequestOptions = {
  //     method: 'POST',
  //     headers: {
  //       'vx-user-key': authorizationKey,
  //     },
  //     body: JSON.stringify({
  //       params: '10003864',
  //     }),
  //   };

  //   try {
  //     const leaveBalanceResponse = await fetch(this.leaveBalanceEndpoint, leaveBalanceRequestOptions);
  //     if (!leaveBalanceResponse.ok) {
  //       throw new Error('Leave balance retrieval failed');
  //     }

  //     const leaveBalanceData = await leaveBalanceResponse.json();
  //     return leaveBalanceData;
  //   } catch (error) {
  //     console.error('Leave Balance Retrieval Error:', error.message);
  //     throw error;
  //   }
  // }

  public render(): React.ReactElement<ILeaveBalancesAndClaimsProps> {
    const {
      /*isDarkTheme,*/
      hasTeamsContext/*,
      userDisplayName*/
    } = this.props;

    return (
      <section className={`${styles.leaveBalancesAndClaims} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.leaveBalancesAndClaims}>
          <h2>Leave Balances</h2>
          <div>
            Annual Leave Days Available: <strong>{this.state.availableBalance}</strong>
          </div>
        </div>
      </section>
    );
  }
}

