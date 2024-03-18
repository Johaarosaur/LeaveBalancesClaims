import * as React from 'react';
import styles from './LeaveBalancesAndClaims.module.scss';
import { ILeaveBalancesAndClaimsProps } from './ILeaveBalancesAndClaimsProps';

export interface ILeaveBalance {
  leaveDescription: string;
  availableBalance: string;
}

export interface IClaim {
  Personcode: string;
  EmployeeCode: string;
  Paycode: string;
  Reference: string;
  ClaimValue: string;
  ClaimType: string;
  ClaimDescription: string;
  ProcessType: string;
  ClaimDate: string;
  ProcessDate: string;
  PayStatus: string;
}

interface ILeaveBalancesAndClaimsState {
  leaveDescription: string;
  availableBalance: string;
  authenticateKey: string;
  outstandingClaims: string;
}

export default class LeaveBalancesAndClaims extends React.Component<ILeaveBalancesAndClaimsProps, ILeaveBalancesAndClaimsState> {
  constructor(props: ILeaveBalancesAndClaimsProps) {
    super(props);
    this.state = {
      authenticateKey: "",
      leaveDescription: "",
      availableBalance: "",
      outstandingClaims: ""
    };
  }

  async componentDidMount(): Promise<void> {
    try {
      await this.authenticate();
      await this.fetchLeaveBalances();
      await this.fetchOutstandingClaims();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  fetchLeaveBalances = async (): Promise<void> => {
    const baseURL = `https://eohapi.educos.co.za`;
    const leaveBalancesEndpoint = `${baseURL}/collect/leavebal`;
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'vx-user-key': this.state.authenticateKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "params": "'10004240'"
      }),
    };

    try {
      const response = await fetch(leaveBalancesEndpoint, requestOptions);

      if (response.ok) {
        const leaveData = await response.json();

        if (leaveData) {
          const annualLeave = leaveData.find((item: any) => item.LeaveDescription === 'Annual');

          if (annualLeave) {
            this.setState({
              leaveDescription: annualLeave.LeaveDescription,
              availableBalance: annualLeave.AvailBal,
            });
          } else {
            console.error('Error: Annual leave data not found');
          }
        } else {
          console.error('Error: Invalid leave data');
        }
      } else {
        throw new Error('Error: ' + response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  fetchOutstandingClaims = async (): Promise<void> => {
    const baseURL = `https://eohapi.educos.co.za`;
    const claimsEndpoint = `${baseURL}/collect/claims/`;
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'vx-user-key': this.state.authenticateKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "params": "'10004240'"
      }),
    };

    try {
      const response = await fetch(claimsEndpoint, requestOptions);

      if (response.ok) {
        const claimsData: IClaim[] = await response.json();

        if (claimsData) {
          const outstandingClaim = claimsData.find((claim: IClaim) => claim.ClaimValue === '915.0000');

          if (outstandingClaim) {
            this.setState({
              outstandingClaims: outstandingClaim.ClaimValue,
            });
          } else {
            console.error('Error: Outstanding claim data not found');
          }
        } else {
          console.error('Error: Invalid claim data');
        }
      } else {
        throw new Error('Error: ' + response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  authenticate = async (): Promise<void> => {
    const baseURL = `https://eohapi.educos.co.za`;
    const GID = "10004240";  // Updated GID value
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

      if (response.ok) {
        const data = await response.json();

        if (data) {
          const authKey = data.key;
          this.setState({
            authenticateKey: authKey,
          });
          console.log('authKey:', this.state.authenticateKey)
        } else {
          console.error('Error: invalid data');
        }
      } else {
        throw new Error('Error:' + response.statusText);
      }

    } catch (error) {
      console.error('Error:', error);
    }
  }

  public render(): React.ReactElement<ILeaveBalancesAndClaimsProps> {
    const { hasTeamsContext } = this.props;
    const { availableBalance, outstandingClaims } = this.state;
  
    return (
      <section className={`${styles.leaveBalancesAndClaims} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.container}>
          <h2 className={styles.header}>Leave Balances and Claims</h2>
          <div className={styles.leaveInfo}>
            {availableBalance && (
              <div className={styles.annualLeave}>
                <strong>Annual Leave Days Available:</strong> {availableBalance}
              </div>
            )}
          </div>
          <div className={styles.claimsInfo}>
            {outstandingClaims && (
              <div className={styles.outstandingClaims}>
                <strong>Outstanding Claims:</strong> {outstandingClaims}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
  

}
